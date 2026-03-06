import { NextRequest, NextResponse } from "next/server";
import { getDVFData } from "@/lib/dvf-service";

// In-memory response cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  const citycode = request.nextUrl.searchParams.get("citycode");
  const cityName = request.nextUrl.searchParams.get("city") || "";

  if (!citycode) {
    return NextResponse.json(
      { error: "Le paramètre 'citycode' est requis" },
      { status: 400 }
    );
  }

  // Check cache
  const cacheKey = citycode;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const result = await getDVFData(citycode, cityName);

    // Store in cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DVF query error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données DVF" },
      { status: 500 }
    );
  }
}
