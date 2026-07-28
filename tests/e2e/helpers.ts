import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Every account these tests create is prefixed `uitest` so global teardown can
 * find and delete it. Never remove that prefix.
 */
export const TEST_PREFIX = "uitest";

export type TestUser = { username: string; email: string; password: string; displayName: string };

let seq = 0;
export function newUser(displayName = "Test Person"): TestUser {
  const id = `${Date.now()}${seq++}`;
  return {
    username: `${TEST_PREFIX}${id}`,
    email: `${TEST_PREFIX}.${id}@mailinator.com`,
    password: "TestPass!2468",
    displayName,
  };
}

let ipCounter = 0;

/**
 * Signup is limited to 5 per hour per IP. The per-test fixture IP is not enough
 * on its own — several tests create two accounts, and the suite as a whole
 * creates far more than five — so each signup presents its own address. The
 * limiter itself stays fully active and is covered by rate-limit.spec.ts.
 */
function nextTestIp() {
  ipCounter += 1;
  return `10.${(ipCounter >> 16) & 255}.${(ipCounter >> 8) & 255}.${ipCounter & 255}`;
}

export async function signUp(page: Page, user = newUser()) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": nextTestIp() });
  await page.goto("/signup");
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="displayName"]', user.displayName);
  await page.fill('input[name="username"]', user.username);
  await page.locator("main button[type=submit]").click();
  await page.waitForURL((u) => !u.pathname.includes("/signup"), { timeout: 45_000 });
  return user;
}

export async function logIn(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.locator("main button[type=submit]").click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45_000 });
}

export async function logOut(page: Page, user: TestUser) {
  await page.goto(`/owners/${user.username}`);
  await page.locator('button[aria-label="Log out"]').click();
  await page.waitForLoadState("networkidle");
}

/** A tiny valid PNG on disk, for upload inputs. */
export function tinyPng() {
  const p = path.join(os.tmpdir(), `petsocial-test-${Date.now()}.png`);
  fs.writeFileSync(
    p,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAWklEQVR42u3QMQEAAAgDINc/9Kzg" +
        "AwmQqrZ3AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
        "AAAAAAAAAAAAAAAAgLcFVngAAWjBudsAAAAASUVORK5CYII=",
      "base64"
    )
  );
  return p;
}

export async function createPet(page: Page, name: string, species = "Dog", breed = "Corgi") {
  await page.goto("/pets/new");
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="species"]', species);
  await page.fill('input[name="breed"]', breed);
  await page.locator("main button[type=submit]").click();
  await page.waitForLoadState("networkidle");
  await expect(page).not.toHaveURL(/\/pets\/new/);
}

export async function createPost(page: Page, caption: string, opts: { image?: boolean } = {}) {
  await page.goto("/posts/new");
  await page.fill('textarea[name="caption"]', caption);
  if (opts.image) {
    await page.locator('input[type="file"]').setInputFiles(tinyPng());
    await page.waitForFunction(
      () => (document.querySelector('input[name="mediaUrl"]') as HTMLInputElement)?.value.length > 0,
      undefined,
      { timeout: 45_000 }
    );
  }
  await page.locator("main button[type=submit]").click();
  await page.waitForLoadState("networkidle");
  await expect(page).not.toHaveURL(/\/posts\/new/);
}

export async function setPrivate(page: Page, user: TestUser, isPrivate: boolean) {
  await page.goto(`/owners/${user.username}/edit`);
  const box = page.locator('input[name="isPrivate"]');
  if (isPrivate) await box.check();
  else await box.uncheck();
  await page.locator("main button[type=submit]").click();
  await page.waitForLoadState("networkidle");
}
