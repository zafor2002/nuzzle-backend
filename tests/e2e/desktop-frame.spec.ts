import { test, expect } from "@playwright/test";
import { signUp, newUser } from "./helpers";

/**
 * Uses a plain desktop context rather than the phone-emulating fixture: the
 * frame is an `lg:` treatment, and an emulated phone keeps a narrow layout
 * viewport no matter how large the window is set, so `lg:` never applies.
 */
test("on a desktop window the app sits in a phone frame with its own chrome", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    extraHTTPHeaders: { "x-forwarded-for": "192.0.2.77" },
  });
  const page = await context.newPage();
  await signUp(page, newUser("Frame Tester"));
  await page.goto("/feed");

  const box = await page.evaluate(() => {
    const frame = document.querySelector("body > div > div") as HTMLElement;
    const nav = document.querySelector('nav[aria-label="Primary"]') as HTMLElement;
    const f = frame.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    return {
      frame: { w: Math.round(f.width), left: Math.round(f.left), bottom: Math.round(f.bottom) },
      nav: { w: Math.round(n.width), left: Math.round(n.left), bottom: Math.round(n.bottom) },
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      radius: getComputedStyle(frame).borderRadius,
    };
  });

  // Frame is a centred phone-width column, not the whole window.
  expect(box.frame.w).toBe(420);
  expect(box.frame.w).toBeLessThan(box.viewportW);
  expect(box.radius).toBe("44px");

  // The nav is fixed; it must be contained by the frame rather than pinned to
  // the browser window. Without the transform on the frame it would sit at the
  // bottom of the viewport and span its full width.
  expect(box.nav.w, "nav should be frame-width, not window-width").toBe(box.frame.w);
  expect(box.nav.left, "nav should start at the frame's left edge").toBe(box.frame.left);
  expect(
    Math.abs(box.nav.bottom - box.frame.bottom),
    "nav should sit at the frame's bottom, not the window's"
  ).toBeLessThanOrEqual(2);

  // Nothing may spill horizontally out of the frame.
  const overflow = await page.evaluate(() => {
    const frame = document.querySelector("body > div > div") as HTMLElement;
    const f = frame.getBoundingClientRect();
    return [...frame.querySelectorAll("*")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > f.right + 1 || r.left < f.left - 1);
      })
      .slice(0, 3)
      .map((el) => (el as HTMLElement).className || el.tagName);
  });
  expect(overflow, `elements spilling outside the frame: ${overflow.join(" | ")}`).toEqual([]);

  await context.close();
});
