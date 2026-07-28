import { test, expect } from "./fixtures";
import { signUp, tinyPng, newUser } from "./helpers";

test.describe("stories", () => {
  test("post a story, see it in the tray, open the viewer", async ({ page }) => {
    const user = newUser("Story Teller");
    await signUp(page, user);

    await page.goto("/stories/new");
    await page.locator('input[type="file"]').setInputFiles(tinyPng());
    await page.waitForFunction(
      () => (document.querySelector('input[name="mediaUrl"]') as HTMLInputElement)?.value.length > 0,
      undefined,
      { timeout: 45_000 }
    );
    const caption = `story caption ${Date.now()}`;
    await page.fill('textarea[name="caption"]', caption);
    await page.locator("main button[type=submit]").click();
    await page.waitForLoadState("networkidle");

    // Tray shows "Your story".
    await expect(page.getByText("Your story")).toBeVisible();

    // Opening it shows the viewer with the caption.
    await page.getByText("Your story").click();
    await expect(page.getByRole("dialog", { name: "Stories" })).toBeVisible();
    await expect(page.getByText(caption)).toBeVisible();

    // Closing returns to the feed.
    await page.getByRole("button", { name: "Close stories" }).click();
    await expect(page.getByRole("dialog", { name: "Stories" })).toHaveCount(0);
  });

  test("a story is not shown to someone who does not follow the author", async ({ page }) => {
    const author = newUser("Unfollowed Author");
    await signUp(page, author);
    await page.goto("/stories/new");
    await page.locator('input[type="file"]').setInputFiles(tinyPng());
    await page.waitForFunction(
      () => (document.querySelector('input[name="mediaUrl"]') as HTMLInputElement)?.value.length > 0,
      undefined,
      { timeout: 45_000 }
    );
    await page.locator("main button[type=submit]").click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Your story")).toBeVisible();

    // Sign out, sign up as a stranger: the author's story must not appear.
    await page.goto(`/owners/${author.username}`);
    await page.locator('button[aria-label="Log out"]').click();
    await page.waitForLoadState("networkidle");

    const stranger = newUser("A Stranger");
    await signUp(page, stranger);
    await page.goto("/feed");
    await expect(page.getByText(author.displayName)).toHaveCount(0);
  });
});
