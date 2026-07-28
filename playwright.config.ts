import { defineConfig, devices } from "@playwright/test";

// Run against a production build, not `next dev`: in dev every route compiles
// on first hit, which turned a full pass into well over an hour. `next start`
// also avoids Next's refusal to run a second dev server in one directory.
const PORT = Number(process.env.E2E_PORT ?? 3002);

export default defineConfig({
  testDir: "./tests/e2e",
  // These hit the real Supabase project, so run serially: parallel signups
  // trip the auth rate limit and shared vet slots race each other.
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Phone-sized: the app is mobile-only by design.
    ...devices["Pixel 7"],
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    // Never reuse: the rate limiter keeps its counters in memory, so a server
    // left running from an earlier run starts the next one with the signup
    // limit already spent — which fails every test for reasons that have
    // nothing to do with the code under test.
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
