import { describe, it, expect } from "vitest";

// Same regex used in app/api/dvf/route.ts
const CITYCODE_RE = /^(?:\d{5}|2[AB]\d{3})$/;

describe("citycode validation", () => {
  it("accepts standard 5-digit codes", () => {
    expect(CITYCODE_RE.test("33063")).toBe(true); // Bordeaux
    expect(CITYCODE_RE.test("75056")).toBe(true); // Paris
    expect(CITYCODE_RE.test("13055")).toBe(true); // Marseille
    expect(CITYCODE_RE.test("00001")).toBe(true);
  });

  it("accepts Corsica codes (2A/2B prefix)", () => {
    expect(CITYCODE_RE.test("2A004")).toBe(true); // Ajaccio
    expect(CITYCODE_RE.test("2B033")).toBe(true); // Bastia
  });

  it("rejects path traversal attempts", () => {
    expect(CITYCODE_RE.test("../../etc")).toBe(false);
    expect(CITYCODE_RE.test("../passwd")).toBe(false);
  });

  it("rejects empty and short strings", () => {
    expect(CITYCODE_RE.test("")).toBe(false);
    expect(CITYCODE_RE.test("123")).toBe(false);
    expect(CITYCODE_RE.test("1234")).toBe(false);
  });

  it("rejects too-long strings", () => {
    expect(CITYCODE_RE.test("123456")).toBe(false);
    expect(CITYCODE_RE.test("330630")).toBe(false);
  });

  it("rejects non-numeric characters", () => {
    expect(CITYCODE_RE.test("abcde")).toBe(false);
    expect(CITYCODE_RE.test("33O63")).toBe(false); // letter O not zero
    expect(CITYCODE_RE.test("3306;")).toBe(false);
  });

  it("rejects lowercase Corsica prefix", () => {
    expect(CITYCODE_RE.test("2a004")).toBe(false);
    expect(CITYCODE_RE.test("2b033")).toBe(false);
  });

  it("rejects injection payloads", () => {
    expect(CITYCODE_RE.test("33063&extra=1")).toBe(false);
    expect(CITYCODE_RE.test("33063%00")).toBe(false);
    expect(CITYCODE_RE.test("<script>")).toBe(false);
  });
});
