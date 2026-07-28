import { test, expect } from "./fixtures";
import { signUp, logIn, logOut, createPost, newUser } from "./helpers";

/**
 * Two of these drive several accounts through sign-up, log-out and log-in, which
 * runs past the 90s default long before anything is actually wrong — the symptom
 * is a pending assertion reported as a failure, not a test-timeout message.
 */
test.describe("settings", () => {
  test.setTimeout(240_000);

  test("the settings hub is reachable from your own profile", async ({ page }) => {
    const user = await signUp(page, newUser("Settings Owner"));
    await page.goto(`/owners/${user.username}`);
    await page.locator('a[aria-label="Settings"]').click();
    await expect(page).toHaveURL(/\/settings$/);

    for (const [href, heading] of [
      ["/settings/account", "Account"],
      ["/settings/privacy", "Privacy"],
      ["/settings/notifications", "Notifications"],
    ] as const) {
      await page.goto("/settings");
      await page.locator(`main a[href="${href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    }
  });

  test("settings are private to the signed-in owner", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a privacy change made in settings persists", async ({ page }) => {
    await signUp(page, newUser("Privacy Settings"));
    await page.goto("/settings/privacy");
    await expect(page.locator('input[name="isPrivate"]')).not.toBeChecked();

    await page.locator('input[name="isPrivate"]').check();
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("Privacy settings saved.")).toBeVisible();

    // Reloaded from the database, not from the form's own state.
    await page.reload();
    await expect(page.locator('input[name="isPrivate"]')).toBeChecked();
    // ...and the profile editor, which reads the same column, agrees.
    await page.goto(`/settings`);
    await page.goto(`/settings/privacy`);
    await expect(page.locator('input[name="isPrivate"]')).toBeChecked();
  });

  test("switching a notification type off stops it being created", async ({ page }) => {
    const author = await signUp(page, newUser("Notify Author"));
    // Two posts, so the "off" and "on" halves each get a fresh like. Toggling a
    // single like off and on again races the revalidation and proves nothing
    // extra.
    await createPost(page, `notify pref off ${Date.now()}`);
    await createPost(page, `notify pref on ${Date.now()}`);
    await page.goto("/feed");
    const postHrefs = await page.locator("main a[href^='/posts/']").evaluateAll((els) => [
      ...new Set(els.map((el) => (el as HTMLAnchorElement).getAttribute("href")!)),
    ]);
    expect(postHrefs.length).toBeGreaterThanOrEqual(2);
    const [firstPost, secondPost] = postHrefs;

    // Turn likes off.
    await page.goto("/settings/notifications");
    await page.locator('input[name="notifyLikes"]').uncheck();
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("Notification settings saved.")).toBeVisible();

    // Someone else likes the post.
    await logOut(page, author);
    const liker = await signUp(page, newUser("Notify Liker"));
    await page.goto(firstPost);
    await page.locator('button[aria-label="Like"]').first().click();
    await expect(page.locator('button[aria-label="Unlike"]').first()).toBeVisible();

    // The author is not told, and the unread badge does not light up either —
    // the point of dropping the write rather than filtering the list.
    await logOut(page, liker);
    await logIn(page, author);
    await page.goto("/notifications");
    await expect(page.getByText(/liked your post/)).toHaveCount(0);
    await expect(page.locator('a[aria-label="Activity"] span')).toHaveCount(0);

    // Turn it back on and the same action does notify.
    await page.goto("/settings/notifications");
    await page.locator('input[name="notifyLikes"]').check();
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("Notification settings saved.")).toBeVisible();

    await logOut(page, author);
    await logIn(page, liker);
    await page.goto(secondPost);
    await page.locator('button[aria-label="Like"]').first().click();
    await expect(page.locator('button[aria-label="Unlike"]').first()).toBeVisible();

    await logOut(page, liker);
    await logIn(page, author);
    await page.goto("/notifications");
    await expect(page.getByText(/liked your post/).first()).toBeVisible();
  });

  test("changing the password requires the current one and takes effect", async ({ page }) => {
    const user = await signUp(page, newUser("Password Changer"));
    const newPassword = "NewTestPass!1357";

    await page.goto("/settings/account");
    await expect(page.getByText(user.email)).toBeVisible();

    // Wrong current password is refused.
    await page.fill('input[name="currentPassword"]', "definitely-not-it");
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("Your current password is not correct.")).toBeVisible();

    // Mismatched confirmation is refused.
    await page.fill('input[name="currentPassword"]', user.password);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', `${newPassword}-different`);
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("The new passwords do not match.")).toBeVisible();

    // The real change.
    await page.fill('input[name="currentPassword"]', user.password);
    await page.fill('input[name="newPassword"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.locator("main button[type=submit]").click();
    await expect(page.getByText("Password updated.")).toBeVisible();

    // The new password works and the old one does not.
    await logOut(page, user);
    await logIn(page, { ...user, password: newPassword });
    await expect(page).toHaveURL(/\/(feed)?$/);

    await logOut(page, { ...user, password: newPassword });
    await page.goto("/login");
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.locator("main button[type=submit]").click();
    await expect(page.locator("main")).toContainText(/invalid|credential/i);
  });
});
