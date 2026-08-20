import { describe, expect, it } from "vitest";
import { calculateFleetRoi, DRIVER_STEPS, PRO_MONTHLY_PRICE } from "../client/src/lib/fleetRoi";

describe("calculateFleetRoi", () => {
  it.each([
    [5, 1500, 1351],
    [10, 3000, 2851],
    [20, 6000, 5851],
    [50, 15000, 14851],
  ])("estima comisiones y potencial para %i conductores", (drivers, expectedCommissions, expectedPotential) => {
    expect(calculateFleetRoi(drivers)).toEqual({
      monthlyCommissions: expectedCommissions,
      potentialAfterPlan: expectedPotential,
    });
  });

  it("mantiene las posiciones comerciales del selector y el precio Pro", () => {
    expect(DRIVER_STEPS).toEqual([5, 10, 20, 50]);
    expect(PRO_MONTHLY_PRICE).toBe(149);
  });
});
