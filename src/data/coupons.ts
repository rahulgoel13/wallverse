/** Demonstration coupons — served directly in static mode, seeded in database mode. */
export const coupons = [
  { code: "WELCOME10", type: "percent" as const, value: 10, minSubtotal: 2000, active: true },
  { code: "FLAT500", type: "flat" as const, value: 500, minSubtotal: 6000, active: true },
];
