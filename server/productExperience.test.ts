import { describe, expect, it } from "vitest";
import { getBookingProgressIndex, getRecommendedPlanIndex } from "../client/src/lib/productExperience";

describe("product experience helpers", () => {
  it("maps reservation states to understandable progress steps", () => {
    expect(getBookingProgressIndex("form")).toBe(0);
    expect(getBookingProgressIndex("estimate")).toBe(1);
    expect(getBookingProgressIndex("confirmation")).toBe(2);
  });

  it("recommends plans according to driver capacity", () => {
    expect(getRecommendedPlanIndex(5)).toBe(0);
    expect(getRecommendedPlanIndex(10)).toBe(1);
    expect(getRecommendedPlanIndex(50)).toBe(1);
    expect(getRecommendedPlanIndex(100)).toBe(2);
  });
});
