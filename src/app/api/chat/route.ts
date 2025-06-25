import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { ERROR_MESSAGES, IMAGE_CONFIG } from "@/lib/constants";
import { ChatRequest } from "@/lib/types";
import {
  GeminiPart,
  ChatApiResponse,
  ApiErrorResponse,
  ParsedImageData,
} from "@/lib/api-types";

export async function POST(
  request: Request
): Promise<NextResponse<ChatApiResponse | ApiErrorResponse>> {
  try {
    const body: ChatRequest = await request.json();
    const { message, image } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_MESSAGE },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error("Google API key is not configured");
      return NextResponse.json(
        { error: ERROR_MESSAGES.INVALID_API_KEY },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const parts: GeminiPart[] = [
      {
        text: `${SYSTEM_PROMPT}\n\nUser message: ${message.trim()}`,
      },
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

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NO_AI_RESPONSE },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: text.trim(),
      timestamp: new Date().toISOString(),
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

    const mimeMatch = mimeData.match(/:(.*?);/);
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
      details:
        process.env.NODE_ENV === "development" ? String(error) : undefined,
    },
    { status: 500 }
  );
}
