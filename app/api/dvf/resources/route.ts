import { NextResponse } from "next/server";
import { getDVFResources } from "@/lib/dvf-service";

export async function GET() {
  try {
    const resources = await getDVFResources();
    return NextResponse.json({ resources });
  } catch (error) {
    console.error("DVF resources error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des ressources DVF" },
      { status: 500 }
    );
  }
}
