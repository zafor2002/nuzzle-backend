import { test, expect } from "@playwright/test";
import { newUser } from "./helpers";

/**
 * Uses the plain Playwright `test` (not the per-IP fixture) so every request in
 * this file shares one apparent IP — that is the whole point: prove the signup
 * limiter still fires. The rest of the suite gets a distinct IP per test so it
 * can run without disabling this protection.
 */
// Six to seven real signups against Supabase Auth do not fit in the default 90s.
test.setTimeout(240_000);

test("signup is rate limited per IP", async ({ browser }) => {
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": "203.0.113.42" },
  });
  const page = await context.newPage();

  let limitHit = false;
  // The limit is 5 per hour; the 6th attempt must be refused.
  for (let i = 0; i < 7 && !limitHit; i++) {
    const user = newUser("Limit Probe");
    await page.goto("/signup");
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="displayName"]', user.displayName);
    await page.fill('input[name="username"]', user.username);
    await page.locator("main button[type=submit]").click();
    await page.waitForLoadState("networkidle");

    if (await page.getByText(/Too many signup attempts/i).isVisible().catch(() => false)) {
      limitHit = true;
      break;
    }
    // Signed in now — sign out so the next signup starts clean.
    await page.goto(`/owners/${user.username}`);
    await page.locator('button[aria-label="Log out"]').click().catch(() => {});
    await page.waitForLoadState("networkidle");
  }

  expect(limitHit, "signup should be refused after the per-IP limit").toBe(true);
  await context.close();
});
