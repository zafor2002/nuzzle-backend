import { test, expect } from "./fixtures";
import { signUp, logIn, logOut, createPost, createPet, newUser, setPrivate } from "./helpers";

test.describe("private accounts", () => {
  test("a private owner's post is hidden from the signed-out feed", async ({ page }) => {
    const owner = newUser("Private Owner");
    await signUp(page, owner);
    const caption = `secret post ${Date.now()}`;
    await createPost(page, caption);

    // Visible to the author while public.
    await page.goto("/feed");
    await expect(page.getByText(caption)).toBeVisible();

    await setPrivate(page, owner, true);
    await logOut(page, owner);

    await page.goto("/feed");
    await expect(page.getByText(caption)).toHaveCount(0);
  });

  test("a private profile is locked to a stranger and its pets 404", async ({ page }) => {
    const owner = newUser("Locked Owner");
    await signUp(page, owner);
    const petName = `Hidden${Date.now()}`;
    await createPet(page, petName);

    // Grab the pet URL while we can still see it.
    await page.goto(`/owners/${owner.username}`);
    const petHref = await page.locator("main a[href^='/pets/']:not([href='/pets/new'])").first().getAttribute("href");
    expect(petHref).toBeTruthy();

    await setPrivate(page, owner, true);
    await logOut(page, owner);

    // Stranger sees the locked state, not the pets.
    await page.goto(`/owners/${owner.username}`);
    await expect(page.getByText("This account is private")).toBeVisible();
    await expect(page.getByText(petName)).toHaveCount(0);

    // Direct link to the pet must not bypass it. Assert on what is rendered
    // rather than the HTTP status: Next streams the shell before notFound()
    // resolves, so a not-found page can still be delivered as 200.
    await page.goto(petHref!);
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByText(petName)).toHaveCount(0);
  });

  test("a direct post link does not bypass privacy", async ({ page }) => {
    const owner = newUser("Direct Link Owner");
    await signUp(page, owner);
    const caption = `direct link post ${Date.now()}`;
    await createPost(page, caption);

    await page.goto("/feed");
    const postHref = await page.locator("main a[href^='/posts/']").first().getAttribute("href");
    expect(postHref).toBeTruthy();

    await setPrivate(page, owner, true);
    await logOut(page, owner);

    await page.goto(postHref!);
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByText(caption)).toHaveCount(0);
  });

  test("the author still sees their own private posts", async ({ page }) => {
    const owner = newUser("Self View Owner");
    await signUp(page, owner);
    const caption = `mine only ${Date.now()}`;
    await createPost(page, caption);
    await setPrivate(page, owner, true);

    await page.goto("/feed");
    await expect(page.getByText(caption)).toBeVisible();
  });

  test("a follower keeps access after the account goes private", async ({ page }) => {
    // Author posts publicly.
    const author = newUser("Followed Author");
    await signUp(page, author);
    const caption = `follower visible ${Date.now()}`;
    await createPost(page, caption);
    await logOut(page, author);

    // Follower follows while it is public.
    const follower = newUser("The Follower");
    await signUp(page, follower);
    await page.goto(`/owners/${author.username}`);
    await page.locator("main button", { hasText: /follow/i }).first().click();
    await page.waitForLoadState("networkidle");
    await logOut(page, follower);

    // Author goes private.
    await logIn(page, author);
    await setPrivate(page, author, true);
    await logOut(page, author);

    // Follower can still see the profile and the post.
    await logIn(page, follower);
    await page.goto(`/owners/${author.username}`);
    await expect(page.getByText("This account is private")).toHaveCount(0);
    await page.goto("/feed");
    await expect(page.getByText(caption)).toBeVisible();
  });
});
