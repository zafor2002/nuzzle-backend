import { test, expect } from "./fixtures";
import { signUp, createPet, createPost, newUser, tinyPng } from "./helpers";

test.describe("core flows", () => {
  test("sign up, add a pet, post as that pet", async ({ page }) => {
    const user = newUser("Core Flow");
    await signUp(page, user);
    const petName = `Momo${Date.now()}`;
    await createPet(page, petName, "Dog", "Golden Retriever");

    await page.goto("/posts/new");
    const caption = `posting as my pet ${Date.now()}`;
    await page.fill('textarea[name="caption"]', caption);
    await page.locator('select[name="petId"]').selectOption({ label: `Post as ${petName}` });
    await page.locator("main button[type=submit]").click();
    await page.waitForLoadState("networkidle");

    await page.goto("/feed");
    await expect(page.getByText(caption)).toBeVisible();
    // Authored by the pet, so the pet's name heads the card.
    await expect(page.locator("main").getByText(petName).first()).toBeVisible();
  });

  test("like persists across a reload", async ({ page }) => {
    await signUp(page);
    await createPost(page, `like me ${Date.now()}`);
    await page.goto("/feed");

    const like = page.locator('button[aria-label="Like"], button[aria-label="Unlike"]').first();
    const before = (await like.innerText()).trim();
    await like.click();
    await expect(async () => {
      const after = (await page
        .locator('button[aria-label="Like"], button[aria-label="Unlike"]')
        .first()
        .innerText()).trim();
      expect(after).not.toBe(before);
    }).toPass();

    const afterClick = (await page
      .locator('button[aria-label="Like"], button[aria-label="Unlike"]')
      .first()
      .innerText()).trim();
    await page.reload();
    const afterReload = (await page
      .locator('button[aria-label="Like"], button[aria-label="Unlike"]')
      .first()
      .innerText()).trim();
    expect(afterReload).toBe(afterClick);
  });

  test("comment appears on the post", async ({ page }) => {
    await signUp(page);
    await createPost(page, `comment target ${Date.now()}`);
    await page.goto("/feed");
    await page.locator("main a[href^='/posts/']").first().click();
    await page.waitForLoadState("networkidle");

    const body = `nice one ${Date.now()}`;
    await page.fill('textarea[name="body"], input[name="body"]', body);
    await page.locator("main button[type=submit]").last().click();
    await expect(page.getByText(body)).toBeVisible();
  });

  test("the action row is horizontal, not stacked", async ({ page }) => {
    // Regression guard: .acts was once scoped to .post, so the post detail
    // screen lost display:flex and stacked the buttons vertically.
    await signUp(page);
    await createPost(page, `layout check ${Date.now()}`);
    await page.goto("/feed");
    await page.locator("main a[href^='/posts/']").first().click();
    await page.waitForLoadState("networkidle");

    const stacked = await page.evaluate(() => {
      const like = document.querySelector('button[aria-label="Like"], button[aria-label="Unlike"]');
      if (!like?.parentElement) return "no like button";
      const kids = [...like.parentElement.children];
      if (kids.length < 2) return "fewer than 2 actions";
      const a = kids[0].getBoundingClientRect();
      const b = kids[1].getBoundingClientRect();
      return Math.abs(a.top - b.top) < 6 ? false : `stacked (${a.top} vs ${b.top})`;
    });
    expect(stacked).toBe(false);
  });

  test("chrome stays in the mobile column on a wide screen", async ({ page }) => {
    // The app is mobile-only: on a desktop window the bar may span the viewport
    // but its contents must line up with the feed column, not spread edge to edge.
    await signUp(page);
    await page.setViewportSize({ width: 1900, height: 900 });
    await page.goto("/feed");

    const widths = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Primary"]');
      const inner = nav?.firstElementChild;
      const main = document.querySelector("main");
      const header = document.querySelector("header > div");
      return {
        main: main ? Math.round(main.getBoundingClientRect().width) : null,
        header: header ? Math.round(header.getBoundingClientRect().width) : null,
        navContents: inner ? Math.round(inner.getBoundingClientRect().width) : null,
      };
    });

    // Assert the relationship, not a pixel count: the fixture emulates a phone,
    // so the layout viewport is not the window width. What matters is that the
    // chrome tracks the content column instead of spanning the window.
    expect(widths.main).toBeGreaterThan(0);
    expect(widths.header, "header contents should match the feed column").toBe(widths.main);
    expect(widths.navContents, "bottom nav contents should match the feed column").toBe(
      widths.main
    );
    expect(widths.main, "content column should stay capped, not fill the window").toBeLessThanOrEqual(
      512
    );
  });

  test("an uploaded image posts and renders", async ({ page }) => {
    await signUp(page);
    const caption = `with image ${Date.now()}`;
    await createPost(page, caption, { image: true });
    await page.goto("/feed");
    await expect(page.getByText(caption)).toBeVisible();
    await expect(page.locator("main img").first()).toBeVisible();
  });

  test("a forged external media URL is rejected", async ({ page }) => {
    await signUp(page);
    await page.goto("/posts/new");
    const caption = `forged ${Date.now()}`;
    await page.fill('textarea[name="caption"]', caption);
    await page.evaluate(() => {
      const input = document.querySelector('input[name="mediaUrl"]') as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )!.set!;
      setter.call(input, "https://evil.example.com/tracker.gif");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.locator("main button[type=submit]").click();

    await expect(page.getByText("Images must be uploaded through the app.")).toBeVisible();
    await page.goto("/feed");
    await expect(page.getByText(caption)).toHaveCount(0);
  });

  test("oversized and non-image uploads are refused client-side", async ({ page }) => {
    await signUp(page);
    await page.goto("/posts/new");

    const fs = await import("node:fs");
    const os = await import("node:os");
    const path = await import("node:path");
    const txt = path.join(os.tmpdir(), `bad-${Date.now()}.txt`);
    fs.writeFileSync(txt, "not an image");
    await page.locator('input[type="file"]').setInputFiles(txt);
    await expect(page.getByText(/JPEG, PNG, WebP or GIF/)).toBeVisible();

    const big = path.join(os.tmpdir(), `big-${Date.now()}.png`);
    fs.writeFileSync(big, Buffer.alloc(6 * 1024 * 1024, 1));
    await page.locator('input[type="file"]').setInputFiles(big);
    await expect(page.getByText(/limit is 5MB/)).toBeVisible();

    // and a good file still works
    await page.locator('input[type="file"]').setInputFiles(tinyPng());
    await page.waitForFunction(
      () => (document.querySelector('input[name="mediaUrl"]') as HTMLInputElement)?.value.length > 0,
      undefined,
      { timeout: 45_000 }
    );
  });

  test("health logs are owner-only", async ({ page }) => {
    const owner = newUser("Health Owner");
    await signUp(page, owner);
    const petName = `Healthy${Date.now()}`;
    await createPet(page, petName);

    await page.goto(`/owners/${owner.username}`);
    const petHref = await page.locator("main a[href^='/pets/']:not([href='/pets/new'])").first().getAttribute("href");
    await page.goto(petHref!);
    await expect(page.getByText("Health log")).toBeVisible();

    // A stranger does not get the health section.
    await page.goto(`/owners/${owner.username}`);
    await page.locator('button[aria-label="Log out"]').click();
    await page.waitForLoadState("networkidle");

    await page.goto(petHref!);
    await expect(page.getByText("Health log")).toHaveCount(0);
  });
});

test.describe("every screen renders", () => {
  const routes = [
    "/feed",
    "/explore",
    "/search",
    "/communities",
    "/notifications",
    "/messages",
    "/marketplace",
    "/adoption",
    "/lost-found",
    "/vet",
    "/vet/appointments",
    "/settings",
    "/settings/account",
    "/settings/privacy",
    "/settings/notifications",
    "/posts/new",
    "/pets/new",
    "/marketplace/new",
    "/adoption/new",
    "/lost-found/new",
  ];

  test("no overflow, no page errors, no undefined in copy", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await signUp(page);

    for (const route of routes) {
      await page.goto(route);
      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        text: document.body.innerText,
      }));
      expect(info.overflow, `${route} overflows horizontally`).toBe(false);
      expect(info.text.length, `${route} rendered almost nothing`).toBeGreaterThan(40);
      expect(info.text, `${route} leaks undefined/NaN`).not.toMatch(/\bundefined\b|\bNaN\b/);
    }

    expect(errors, `page errors: ${errors.join(" | ")}`).toHaveLength(0);
  });
});
