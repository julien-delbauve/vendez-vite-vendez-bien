import { describe, it, expect } from "vitest";
import { computeStats, computeMonthlyStats } from "@/lib/compute-stats";
import { Transaction } from "@/lib/types";

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    date: "2024-01-15",
    address: "1 Rue Test",
    propertyType: "Maison",
    surface: 100,
    price: 200000,
    pricePerSqm: 2000,
    ...overrides,
  };
}

describe("computeStats", () => {
  it("returns zeros for empty array", () => {
    const result = computeStats([]);
    expect(result.averagePrice).toBe(0);
    expect(result.medianPrice).toBe(0);
    expect(result.averagePricePerSqm).toBe(0);
    expect(result.byPropertyType).toEqual([]);
    expect(result.byYear).toEqual([]);
  });

  it("computes average price", () => {
    const result = computeStats([
      tx({ price: 100000 }),
      tx({ price: 200000 }),
      tx({ price: 300000 }),
    ]);
    expect(result.averagePrice).toBe(200000);
  });

  it("computes median price for odd count", () => {
    const result = computeStats([
      tx({ price: 100000 }),
      tx({ price: 300000 }),
      tx({ price: 500000 }),
    ]);
    expect(result.medianPrice).toBe(300000);
  });

  it("computes median price for even count", () => {
    const result = computeStats([
      tx({ price: 100000 }),
      tx({ price: 200000 }),
      tx({ price: 300000 }),
      tx({ price: 400000 }),
    ]);
    expect(result.medianPrice).toBe(250000);
  });

  it("computes average price per sqm, skipping zero-surface", () => {
    const result = computeStats([
      tx({ surface: 100, pricePerSqm: 2000 }),
      tx({ surface: 0, pricePerSqm: 0 }),
      tx({ surface: 50, pricePerSqm: 3000 }),
    ]);
    expect(result.averagePricePerSqm).toBe(2500);
  });

  it("groups by property type", () => {
    const result = computeStats([
      tx({ propertyType: "Maison", price: 300000 }),
      tx({ propertyType: "Maison", price: 200000 }),
      tx({ propertyType: "Appartement", price: 150000 }),
    ]);
    expect(result.byPropertyType).toHaveLength(2);
    const maison = result.byPropertyType.find((p) => p.type === "Maison");
    expect(maison?.count).toBe(2);
    expect(maison?.avgPrice).toBe(250000);
  });

  it("groups by year and sorts ascending", () => {
    const result = computeStats([
      tx({ date: "2023-06-01", price: 200000 }),
      tx({ date: "2024-03-15", price: 300000 }),
      tx({ date: "2023-09-01", price: 250000 }),
    ]);
    expect(result.byYear).toHaveLength(2);
    expect(result.byYear[0].year).toBe(2023);
    expect(result.byYear[1].year).toBe(2024);
    expect(result.byYear[0].count).toBe(2);
  });

  it("handles single transaction", () => {
    const result = computeStats([tx({ price: 150000 })]);
    expect(result.averagePrice).toBe(150000);
    expect(result.medianPrice).toBe(150000);
  });
});

describe("computeMonthlyStats", () => {
  it("returns empty for empty array", () => {
    expect(computeMonthlyStats([])).toEqual([]);
  });

  it("groups by month and sorts chronologically", () => {
    const result = computeMonthlyStats([
      tx({ date: "2024-03-01", price: 200000 }),
      tx({ date: "2024-01-15", price: 100000 }),
      tx({ date: "2024-03-20", price: 300000 }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("Jan");
    expect(result[1].label).toBe("Mar");
    expect(result[1].count).toBe(2);
  });

  it("uses year suffix for multi-year data", () => {
    const result = computeMonthlyStats([
      tx({ date: "2023-06-01" }),
      tx({ date: "2024-06-01" }),
    ]);
    expect(result[0].label).toBe("Juin '23");
    expect(result[1].label).toBe("Juin '24");
  });

  it("skips transactions with no date", () => {
    const result = computeMonthlyStats([
      tx({ date: "" }),
      tx({ date: "2024-01-01", price: 100000 }),
    ]);
    expect(result).toHaveLength(1);
  });
});
