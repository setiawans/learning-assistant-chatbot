import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "./supabase";
import { MATERIAL_ANALYSIS_PROMPT } from "./prompts";
import { MATERIALS_CONFIG } from "./constants";
import { Material, MaterialAnalysis } from "./types";

export async function analyzeMaterialRequest(
  message: string,
  genAI: GoogleGenerativeAI
): Promise<MaterialAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = MATERIAL_ANALYSIS_PROMPT.replace("{message}", message);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const analysis = JSON.parse(cleanedText);

    return {
      isRequest: analysis.isRequest || false,
      subject: analysis.subject || null,
      type: analysis.type || null,
    };
  } catch (error) {
    console.error("Error analyzing material request:", error);
    return { isRequest: false, subject: null, type: null };
  }
}

export async function fetchMaterials(
  subject: string | null,
  type: string | null
): Promise<Material[] | null> {
  try {
    let query = supabaseAdmin
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(MATERIALS_CONFIG.MAX_MATERIALS_PER_REQUEST);

    if (subject) {
      query = query.ilike("subject", `%${subject}%`);
    }

    if (type && MATERIALS_CONFIG.AVAILABLE_TYPES.includes(type as any)) {
      query = query.eq("type", type);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error("Error fetching materials:", error);
      return null;
    }

    return (materials as Material[]) || [];
  } catch (error) {
    console.error("Error in fetchMaterials:", error);
    return null;
  }
}

export function getMaterialThumbnail(material: Material): string {
  if (material.thumbnail_url) {
    return material.thumbnail_url;
  }

  const fallbacks = {
    video: "/icons/video-icon.png",
    article: "/icons/article-icon.png",
    book: "/icons/book-icon.png",
    course: "/icons/course-icon.png",
    exercise: "/icons/exercise-icon.png",
  };

  return fallbacks[material.type] || "/icons/default-material.png";
}
