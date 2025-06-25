import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const { message, image } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Format pesan tidak valid" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Konfigurasi server bermasalah" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const parts: any[] = [
      { text: `${SYSTEM_PROMPT}\n\nUser message: ${message}` }
    ];

    if (image) {
      const [mimeData, base64Data] = image.split(',');
      const mimeType = mimeData.match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memproses permintaan Anda",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}