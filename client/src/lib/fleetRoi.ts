export const DRIVER_STEPS = [5, 10, 20, 50] as const;
export const PRO_MONTHLY_PRICE = 149;

const ESTIMATED_DAILY_TRIPS_PER_DRIVER = 5;
const ESTIMATED_AVERAGE_FARE = 20;
const ESTIMATED_COMMISSION_RATE = 0.1;
const DAYS_PER_MONTH = 30;

export function calculateFleetRoi(drivers: number) {
  const monthlyCommissions = drivers
    * ESTIMATED_DAILY_TRIPS_PER_DRIVER
    * ESTIMATED_AVERAGE_FARE
    * ESTIMATED_COMMISSION_RATE
    * DAYS_PER_MONTH;

  return {
    monthlyCommissions,
    potentialAfterPlan: monthlyCommissions - PRO_MONTHLY_PRICE,
  };
}
