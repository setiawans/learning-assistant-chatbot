import { NextResponse } from "next/server";
import { fetchMaterials } from "@/lib/materials";
import { ERROR_MESSAGES } from "@/lib/constants";
import { MaterialsApiResponse, ApiErrorResponse } from "@/lib/api-types";

export async function GET(
  request: Request
): Promise<NextResponse<MaterialsApiResponse | ApiErrorResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const type = searchParams.get("type");

    const materials = await fetchMaterials(subject, type);

    if (materials === null) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MATERIALS_FETCH_ERROR },
        { status: 500 }
      );
    }

    return NextResponse.json({
      materials,
      count: materials.length,
    });
  } catch (error) {
    console.error("Materials API Error:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
