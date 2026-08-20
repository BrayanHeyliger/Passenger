export const PLAN_DRIVER_OPTIONS = [1, 5, 10, 25, 50, 100] as const;

export function getBookingProgressIndex(step: string): number {
  if (step === "form") return 0;
  if (step === "estimate") return 1;
  return 2;
}

export function getRecommendedPlanIndex(drivers: number): 0 | 1 | 2 {
  if (drivers <= 5) return 0;
  if (drivers <= 50) return 1;
  return 2;
}
