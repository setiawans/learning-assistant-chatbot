import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "./supabase";
import { createMaterialAnalysisPrompt } from "./prompts";
import { MATERIALS_CONFIG } from "./constants";
import { Material, MaterialAnalysis } from "./types";

export async function analyzeMaterialRequest(
  message: string,
  genAI: GoogleGenerativeAI
): Promise<MaterialAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = createMaterialAnalysisPrompt().replace("{message}", message);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    const analysis = JSON.parse(cleanedText);

    const isValidSubject = analysis.subject && 
      (MATERIALS_CONFIG.AVAILABLE_SUBJECTS as readonly string[]).includes(analysis.subject);

    return {
      isRequest: analysis.isRequest && isValidSubject,
      subject: isValidSubject ? analysis.subject : null,
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
    if (!subject || !(MATERIALS_CONFIG.AVAILABLE_SUBJECTS as readonly string[]).includes(subject)) {
      return [];
    }

    let query = supabaseAdmin
      .from("materials")
      .select("*")
      .eq("subject", subject)
      .order("created_at", { ascending: false })
      .limit(MATERIALS_CONFIG.MAX_MATERIALS_PER_REQUEST);

    if (type && MATERIALS_CONFIG.AVAILABLE_TYPES.includes(type as Material['type'])) {
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