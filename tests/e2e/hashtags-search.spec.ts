import { test, expect } from "./fixtures";
import { signUp, createPost, createPet, newUser } from "./helpers";

test.describe("hashtags and search", () => {
  test("captions link their hashtags and the tag page lists the post", async ({ page }) => {
    await signUp(page);
    const tag = `zt${Date.now()}`;
    const caption = `Beach day #${tag} and #Corgi`;
    await createPost(page, caption);

    await page.goto("/feed");
    const link = page.locator(`main a[href="/hashtags/${tag}"]`).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveText(`#${tag}`);

    await link.click();
    await expect(page).toHaveURL(new RegExp(`/hashtags/${tag}`));
    await expect(page.getByText(caption.split(" #")[0])).toBeVisible();
  });

  test("#Corgi and #corgi resolve to the same tag page", async ({ page }) => {
    await signUp(page);
    const stamp = Date.now();
    await createPost(page, `upper #MixedCase${stamp}`);

    // The stored tag is lower-cased, so the link points at the lower-case page.
    await page.goto("/feed");
    await expect(page.locator(`main a[href="/hashtags/mixedcase${stamp}"]`).first()).toBeVisible();
  });

  test("a purely numeric #2026 is not turned into a tag", async ({ page }) => {
    await signUp(page);
    await createPost(page, `best of #2026 wrap up ${Date.now()}`);
    await page.goto("/feed");
    await expect(page.locator('main a[href="/hashtags/2026"]')).toHaveCount(0);
  });

  test("search finds people, pets and hashtags", async ({ page }) => {
    const user = newUser("Searchable Person");
    await signUp(page, user);
    const stamp = Date.now();
    const petName = `Searchpet${stamp}`;
    await createPet(page, petName, "Dog", "Beagle");
    await createPost(page, `hello #findme${stamp}`);

    // people
    await page.goto(`/search?q=${user.username}`);
    await expect(page.locator(`main a[href="/owners/${user.username}"]`).first()).toBeVisible();

    // pets
    await page.goto(`/search?q=${petName}`);
    await expect(page.getByText(petName).first()).toBeVisible();

    // hashtags
    await page.goto(`/search?q=findme${stamp}`);
    await expect(page.locator(`main a[href="/hashtags/findme${stamp}"]`).first()).toBeVisible();
  });

  test("search with no query prompts instead of listing everything", async ({ page }) => {
    await signUp(page);
    await page.goto("/search");
    await expect(page.getByText("Search PetSocial")).toBeVisible();
  });

  test("search reports no results honestly", async ({ page }) => {
    await signUp(page);
    await page.goto(`/search?q=zzz-definitely-nothing-${Date.now()}`);
    await expect(page.getByText("No results")).toBeVisible();
  });
});
