import { NextRequest, NextResponse } from "next/server";
import { searchAddress } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchAddress(q);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche d'adresse" },
      { status: 500 }
    );
  }
}
