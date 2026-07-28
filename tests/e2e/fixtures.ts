import { test as base } from "@playwright/test";

let n = 0;

/**
 * Each test gets its own browser context carrying a distinct X-Forwarded-For.
 *
 * Signup is rate limited to 5 per hour per IP — correct behaviour that a suite
 * creating an account per test would otherwise trip. Giving each test a
 * different apparent IP keeps the real limiter fully active (it is never
 * disabled or relaxed) while letting the suite run. The limiter itself is
 * covered by its own test in rate-limit.spec.ts.
 */
export const test = base.extend({
  context: async ({ browser }, use) => {
    const ip = `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n % 255}`;
    n += 1;
    const context = await browser.newContext({
      extraHTTPHeaders: { "x-forwarded-for": ip },
    });
    await use(context);
    await context.close();
  },
});

export { expect } from "@playwright/test";
