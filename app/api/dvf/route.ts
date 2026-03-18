import { NextRequest, NextResponse } from "next/server";
import { getDVFData } from "@/lib/dvf-service";

// INSEE citycode: 5 digits, or 2A/2B prefix for Corsica
const CITYCODE_RE = /^(?:\d{5}|2[AB]\d{3})$/;

// Bounded LRU cache
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { data: unknown; timestamp: number }>();

function cacheGet(key: string) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return undefined;
  }
  // Move to end (most recently used)
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function cacheSet(key: string, data: unknown) {
  cache.delete(key); // ensure fresh position
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: NextRequest) {
  const citycode = request.nextUrl.searchParams.get("citycode");
  const cityName = request.nextUrl.searchParams.get("city") || "";

  if (!citycode || !CITYCODE_RE.test(citycode)) {
    return NextResponse.json(
      { error: "Code commune invalide" },
      { status: 400 }
    );
  }

  // Check cache
  const cached = cacheGet(citycode);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const result = await getDVFData(citycode, cityName);
    cacheSet(citycode, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("DVF query error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données DVF" },
      { status: 500 }
    );
  }
}
