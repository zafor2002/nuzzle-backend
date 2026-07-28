import { test, expect } from "@playwright/test";
import { signUp, newUser } from "./helpers";

/**
 * Two concurrent sessions: a message sent by one must appear in the other's
 * open thread without that page being reloaded or navigated.
 */
test.setTimeout(180_000);

test("a sent message appears live in the recipient's open thread", async ({ browser }) => {
  const alice = newUser("Alice Realtime");
  const bob = newUser("Bob Realtime");

  const aliceCtx = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": "198.51.100.10" },
  });
  const bobCtx = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": "198.51.100.11" },
  });
  const alicePage = await aliceCtx.newPage();
  const bobPage = await bobCtx.newPage();

  await signUp(alicePage, alice);
  await signUp(bobPage, bob);

  // Bob opens the thread with Alice and leaves it open.
  await bobPage.goto(`/messages/${alice.username}`);
  await expect(bobPage.getByRole("textbox")).toBeVisible();

  // Alice sends Bob a message.
  const body = `live ping ${Date.now()}`;
  await alicePage.goto(`/messages/${bob.username}`);
  await alicePage.fill('textarea[name="body"], input[name="body"]', body);
  await alicePage.locator("main button[type=submit]").click();
  await expect(alicePage.getByText(body)).toBeVisible();

  // Bob's page must show it without any navigation or reload on his side.
  //
  // Generous timeout on purpose: this is the one assertion that depends on
  // Supabase's Realtime service rather than our own server. Late in a full run —
  // after every test that visited /messages has opened a socket — the first
  // event can take noticeably longer to arrive than it does in isolation.
  await expect(bobPage.getByText(body)).toBeVisible({ timeout: 90_000 });

  await aliceCtx.close();
  await bobCtx.close();
});
