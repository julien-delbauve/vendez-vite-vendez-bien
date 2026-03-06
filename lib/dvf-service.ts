import { listDatasetResources, queryResourceData } from "./mcp-client";
import { DVFResult, Transaction, YearlyStats, PropertyTypeStats } from "./types";

const DVF_DATASET_ID = "5c4ae55a634f4117716d5656";

interface DVFResource {
  id: string;
  title: string;
  year: number;
}

let cachedResources: DVFResource[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

export async function getDVFResources(): Promise<DVFResource[]> {
  if (cachedResources && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedResources;
  }

  const result = await listDatasetResources(DVF_DATASET_ID);

  const resources: DVFResource[] = [];
  const lines = result.split("\n");

  for (const line of lines) {
    // Match resources that are txt/csv data files (not PDFs)
    const yearMatch = line.match(/(\d{4})/);
    const idMatch = line.match(/ID[:\s]+([a-f0-9-]+)/i) || line.match(/`([a-f0-9-]{36})`/);

    if (yearMatch && idMatch) {
      const year = parseInt(yearMatch[1]);
      if (year >= 2019 && year <= 2026) {
        resources.push({
          id: idMatch[1],
          title: line.trim(),
          year,
        });
      }
    }
  }

  // Sort by year descending
  resources.sort((a, b) => b.year - a.year);

  cachedResources = resources;
  cacheTimestamp = Date.now();

  return resources;
}

function parseTransactionsFromText(text: string): Transaction[] {
  const transactions: Transaction[] = [];

  // The MCP query_resource_data returns structured text with transaction data
  // Parse rows from the response - format varies but typically includes tabular data
  const lines = text.split("\n");

  for (const line of lines) {
    // Try to extract transaction data from various formats
    // Common fields: date_mutation, valeur_fonciere, surface_reelle_bati, type_local, adresse
    try {
      // Try JSON parsing first (some responses come as JSON arrays)
      if (line.trim().startsWith("{") || line.trim().startsWith("[")) {
        const parsed = JSON.parse(line.trim().startsWith("[") ? line : `[${line}]`);
        for (const row of Array.isArray(parsed) ? parsed : [parsed]) {
          const tx = extractTransaction(row);
          if (tx) transactions.push(tx);
        }
        continue;
      }

      // Try pipe-delimited or table format
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 4) {
        const price = parseFloat(parts.find((p) => /^\d+[\d.,]*$/.test(p)) || "0");
        if (price > 0) {
          transactions.push({
            date: parts[0] || "",
            address: parts[1] || "",
            propertyType: parts[2] || "Non spécifié",
            surface: parseFloat(parts[3]) || 0,
            price,
            pricePerSqm: parseFloat(parts[3]) > 0 ? price / parseFloat(parts[3]) : 0,
          });
        }
      }
    } catch {
      // Skip unparseable lines
    }
  }

  return transactions;
}

function extractTransaction(row: Record<string, unknown>): Transaction | null {
  const price =
    parseFloat(String(row.valeur_fonciere || row.prix || row.price || "0")) || 0;
  const surface =
    parseFloat(
      String(row.surface_reelle_bati || row.surface || row.surface_terrain || "0")
    ) || 0;

  if (price <= 0) return null;

  return {
    date: String(row.date_mutation || row.date || ""),
    address: String(
      row.adresse_nom_voie || row.adresse || row.address || ""
    ),
    propertyType: String(row.type_local || row.type || "Non spécifié"),
    surface,
    price,
    pricePerSqm: surface > 0 ? price / surface : 0,
    rooms: row.nombre_pieces_principales
      ? parseInt(String(row.nombre_pieces_principales))
      : undefined,
    lat: row.latitude ? parseFloat(String(row.latitude)) : undefined,
    lon: row.longitude ? parseFloat(String(row.longitude)) : undefined,
  };
}

function computeStats(transactions: Transaction[]): {
  averagePrice: number;
  medianPrice: number;
  averagePricePerSqm: number;
  byPropertyType: PropertyTypeStats[];
  byYear: YearlyStats[];
} {
  if (transactions.length === 0) {
    return {
      averagePrice: 0,
      medianPrice: 0,
      averagePricePerSqm: 0,
      byPropertyType: [],
      byYear: [],
    };
  }

  // Average price
  const prices = transactions.map((t) => t.price);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Median price
  const sorted = [...prices].sort((a, b) => a - b);
  const medianPrice =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  // Average price per sqm (only for transactions with surface > 0)
  const withSurface = transactions.filter((t) => t.surface > 0);
  const averagePricePerSqm =
    withSurface.length > 0
      ? withSurface.reduce((a, t) => a + t.pricePerSqm, 0) / withSurface.length
      : 0;

  // By property type
  const typeMap = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const type = tx.propertyType || "Non spécifié";
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(tx);
  }
  const byPropertyType: PropertyTypeStats[] = Array.from(typeMap.entries()).map(
    ([type, txs]) => ({
      type,
      avgPrice: txs.reduce((a, t) => a + t.price, 0) / txs.length,
      avgPricePerSqm:
        txs.filter((t) => t.surface > 0).length > 0
          ? txs
              .filter((t) => t.surface > 0)
              .reduce((a, t) => a + t.pricePerSqm, 0) /
            txs.filter((t) => t.surface > 0).length
          : 0,
      count: txs.length,
    })
  );

  // By year
  const yearMap = new Map<number, Transaction[]>();
  for (const tx of transactions) {
    const year = tx.date ? parseInt(tx.date.substring(0, 4)) : 0;
    if (year > 0) {
      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year)!.push(tx);
    }
  }
  const byYear: YearlyStats[] = Array.from(yearMap.entries())
    .map(([year, txs]) => {
      const yearPrices = txs.map((t) => t.price).sort((a, b) => a - b);
      const yearWithSurface = txs.filter((t) => t.surface > 0);
      return {
        year,
        avgPrice: yearPrices.reduce((a, b) => a + b, 0) / yearPrices.length,
        avgPricePerSqm:
          yearWithSurface.length > 0
            ? yearWithSurface.reduce((a, t) => a + t.pricePerSqm, 0) /
              yearWithSurface.length
            : 0,
        medianPrice:
          yearPrices.length % 2 === 0
            ? (yearPrices[yearPrices.length / 2 - 1] +
                yearPrices[yearPrices.length / 2]) /
              2
            : yearPrices[Math.floor(yearPrices.length / 2)],
        count: txs.length,
      };
    })
    .sort((a, b) => a.year - b.year);

  return { averagePrice, medianPrice, averagePricePerSqm, byPropertyType, byYear };
}

export async function getDVFData(
  citycode: string,
  cityName: string
): Promise<DVFResult> {
  const resources = await getDVFResources();

  // Query the most recent resources (last 3 years for speed)
  const recentResources = resources.slice(0, 3);

  const allTransactions: Transaction[] = [];

  // Query each year's resource in parallel
  const results = await Promise.allSettled(
    recentResources.map(async (resource) => {
      const question = `Toutes les ventes immobilières (nature_mutation = Vente) dans la commune avec le code commune ${citycode}. Retourner: date_mutation, type_local, valeur_fonciere, surface_reelle_bati, nombre_pieces_principales, adresse_nom_voie`;
      const result = await queryResourceData(resource.id, question);
      return parseTransactionsFromText(result);
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allTransactions.push(...result.value);
    }
  }

  const stats = computeStats(allTransactions);
  const departmentCode = citycode.substring(0, 2);

  return {
    ...stats,
    totalTransactions: allTransactions.length,
    transactions: allTransactions
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 100), // Limit to 100 most recent
    cityName,
    departmentCode,
  };
}
