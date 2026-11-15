import { describe, expect, it } from "vitest";
import { formatMonth } from "@/lib/format-month";

describe("formatMonth", () => {
  it("formats YYYY-MM as a short month and year", () => {
    expect(formatMonth("2023-05")).toBe("May 2023");
    expect(formatMonth("2024-06")).toBe("Jun 2024");
    expect(formatMonth("2025-01")).toBe("Jan 2025");
    expect(formatMonth("2025-12")).toBe("Dec 2025");
  });

  it("formats present as Present", () => {
    expect(formatMonth("present")).toBe("Present");
  });

  it("throws on anything else", () => {
    expect(() => formatMonth("2023-13")).toThrow();
    expect(() => formatMonth("2023-5")).toThrow();
    expect(() => formatMonth("Present")).toThrow();
  });
});
