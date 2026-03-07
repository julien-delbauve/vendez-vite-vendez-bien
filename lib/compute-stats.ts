import { Transaction, YearlyStats, MonthlyStats, PropertyTypeStats } from "./types";

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export function computeStats(transactions: Transaction[]): {
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

  const prices = transactions.map((t) => t.price);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const sorted = [...prices].sort((a, b) => a - b);
  const medianPrice =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const withSurface = transactions.filter((t) => t.surface > 0);
  const averagePricePerSqm =
    withSurface.length > 0
      ? withSurface.reduce((a, t) => a + t.pricePerSqm, 0) / withSurface.length
      : 0;

  // By property type — all types pass through
  const typeMap = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const type = tx.propertyType || "Autre";
    if (!typeMap.has(type)) typeMap.set(type, []);
    typeMap.get(type)!.push(tx);
  }
  const byPropertyType: PropertyTypeStats[] = Array.from(typeMap.entries())
    .map(([type, txs]) => {
      const typeSurface = txs.filter((t) => t.surface > 0);
      return {
        type,
        avgPrice: txs.reduce((a, t) => a + t.price, 0) / txs.length,
        avgPricePerSqm:
          typeSurface.length > 0
            ? typeSurface.reduce((a, t) => a + t.pricePerSqm, 0) / typeSurface.length
            : 0,
        count: txs.length,
      };
    })
    .sort((a, b) => b.count - a.count);

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
      const yearSurface = txs.filter((t) => t.surface > 0);
      return {
        year,
        avgPrice: yearPrices.reduce((a, b) => a + b, 0) / yearPrices.length,
        avgPricePerSqm:
          yearSurface.length > 0
            ? yearSurface.reduce((a, t) => a + t.pricePerSqm, 0) / yearSurface.length
            : 0,
        medianPrice:
          yearPrices.length % 2 === 0
            ? (yearPrices[yearPrices.length / 2 - 1] + yearPrices[yearPrices.length / 2]) / 2
            : yearPrices[Math.floor(yearPrices.length / 2)],
        count: txs.length,
      };
    })
    .sort((a, b) => a.year - b.year);

  return { averagePrice, medianPrice, averagePricePerSqm, byPropertyType, byYear };
}

export function computeMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  if (transactions.length === 0) return [];

  const monthMap = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    if (!tx.date) continue;
    const year = parseInt(tx.date.substring(0, 4));
    const month = parseInt(tx.date.substring(5, 7));
    if (!year || !month) continue;

    const key = `${year}-${String(month).padStart(2, "0")}`;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(tx);
  }

  const entries = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Detect if data spans multiple years
  const years = new Set(entries.map(([k]) => k.split("-")[0]));
  const multiYear = years.size > 1;

  return entries.map(([key, txs]) => {
    const [yearStr, monthStr] = key.split("-");
    const monthIdx = parseInt(monthStr) - 1;
    const prices = txs.map((t) => t.price).sort((a, b) => a - b);
    const withSurface = txs.filter((t) => t.surface > 0);

    // "Jan" for single year, "Jan '22" for multi-year
    const label = multiYear
      ? `${MONTH_LABELS[monthIdx]} '${yearStr.slice(2)}`
      : MONTH_LABELS[monthIdx];

    return {
      label,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      avgPricePerSqm:
        withSurface.length > 0
          ? withSurface.reduce((a, t) => a + t.pricePerSqm, 0) / withSurface.length
          : 0,
      medianPrice:
        prices.length % 2 === 0
          ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
          : prices[Math.floor(prices.length / 2)],
      count: txs.length,
    };
  });
}
