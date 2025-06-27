import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, createSystemPromptWithMaterials } from "@/lib/prompts";
import { ERROR_MESSAGES, IMAGE_CONFIG, CHAT_CONFIG } from "@/lib/constants";
import { ChatRequest } from "@/lib/types";
import { analyzeMaterialRequest, fetchMaterials } from "@/lib/materials";
import {
  GeminiPart,
  ApiErrorResponse,
  ParsedImageData,
} from "@/lib/api-types";

export async function POST(request: Request): Promise<NextResponse | Response> {
  try {
    const body: ChatRequest = await request.json();
    const { message, image } = body;

    if (!image && (!message || typeof message !== "string" || message.trim().length === 0)) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_MESSAGE },
        { status: 400 }
      );
    }

    if (message && message.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { 
          error: `Pesan terlalu panjang. Maksimal ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} karakter. Anda mengirim ${message.length} karakter.` 
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message ? message.trim() : "";

    if (!process.env.GOOGLE_API_KEY) {
      console.error("Google API key is not configured");
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_API_KEY },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const materialAnalysis = await analyzeMaterialRequest(trimmedMessage, genAI);
    let materials = null;

    if (materialAnalysis.isRequest) {
      materials = await fetchMaterials(
        materialAnalysis.subject,
        materialAnalysis.type
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const systemPromptWithContext = materials && materials.length > 0
      ? createSystemPromptWithMaterials(materials, materialAnalysis.subject || "ekonomi")
      : SYSTEM_PROMPT;

    const parts: GeminiPart[] = [
      { text: `${systemPromptWithContext}\n\nUser message: ${trimmedMessage || "Please analyze this image."}` },
    ];

    if (image) {
      const imageData = parseImageData(image);
      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        });
      } else {
        return NextResponse.json(
          { error: ERROR_MESSAGES.INVALID_IMAGE_TYPE },
          { status: 400 }
        );
      }
    }

    const result = await model.generateContentStream(parts);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              fullText += chunkText;
              
              const data = JSON.stringify({
                type: 'content',
                content: chunkText,
                fullContent: fullText,
                materials: materials && materials.length > 0 ? materials : undefined
              });
              
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          const finalData = JSON.stringify({
            type: 'done',
            content: fullText,
            timestamp: new Date().toISOString(),
            materials: materials && materials.length > 0 ? materials : undefined
          });
          
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: ERROR_MESSAGES.SERVER_ERROR
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return handleApiError(error);
  }
}

function parseImageData(image: string): ParsedImageData | null {
  try {
    if (!image.startsWith("data:")) {
      return null;
    }

    const [mimeData, base64Data] = image.split(",");

    if (!mimeData || !base64Data) {
      return null;
    }

    const mimeMatch = mimeData.match(/^data:([^;]+);/);
    if (!mimeMatch) {
      return null;
    }

    const mimeType = mimeMatch[1];

    if (!(IMAGE_CONFIG.VALID_TYPES as readonly string[]).includes(mimeType)) {
      return null;
    }

    return { mimeType, data: base64Data };
  } catch {
    return null;
  }
}

function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: ERROR_MESSAGES.SERVER_ERROR,
      details: process.env.NODE_ENV === "development" ? String(error) : undefined,
    },
    { status: 500 }
  );
}