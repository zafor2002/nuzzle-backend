# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-flows.spec.ts >> core flows >> health logs are owner-only
- Location: tests\e2e\core-flows.spec.ts:142:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 45000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "PetSocial" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e7]:
        - link "Log in" [ref=e8] [cursor=pointer]:
          - /url: /login
        - link [ref=e9] [cursor=pointer]:
          - /url: /signup
          - button "Sign up" [ref=e10]
  - main [ref=e12]:
    - paragraph [ref=e13]: 🐾
    - heading "Something went wrong" [level=1] [ref=e14]
    - paragraph [ref=e15]: An unexpected error occurred. You can try again, or head back home.
    - button "Try again" [ref=e16]
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { expect, type Page } from "@playwright/test";
  2  | import fs from "node:fs";
  3  | import os from "node:os";
  4  | import path from "node:path";
  5  | 
  6  | /**
  7  |  * Every account these tests create is prefixed `uitest` so global teardown can
  8  |  * find and delete it. Never remove that prefix.
  9  |  */
  10 | export const TEST_PREFIX = "uitest";
  11 | 
  12 | export type TestUser = { username: string; email: string; password: string; displayName: string };
  13 | 
  14 | let seq = 0;
  15 | export function newUser(displayName = "Test Person"): TestUser {
  16 |   const id = `${Date.now()}${seq++}`;
  17 |   return {
  18 |     username: `${TEST_PREFIX}${id}`,
  19 |     email: `${TEST_PREFIX}.${id}@mailinator.com`,
  20 |     password: "TestPass!2468",
  21 |     displayName,
  22 |   };
  23 | }
  24 | 
  25 | export async function signUp(page: Page, user = newUser()) {
  26 |   await page.goto("/signup");
  27 |   await page.fill('input[name="email"]', user.email);
  28 |   await page.fill('input[name="password"]', user.password);
  29 |   await page.fill('input[name="displayName"]', user.displayName);
  30 |   await page.fill('input[name="username"]', user.username);
  31 |   await page.locator("main button[type=submit]").click();
> 32 |   await page.waitForURL((u) => !u.pathname.includes("/signup"), { timeout: 45_000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 45000ms exceeded.
  33 |   return user;
  34 | }
  35 | 
  36 | export async function logIn(page: Page, user: TestUser) {
  37 |   await page.goto("/login");
  38 |   await page.fill('input[name="email"]', user.email);
  39 |   await page.fill('input[name="password"]', user.password);
  40 |   await page.locator("main button[type=submit]").click();
  41 |   await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45_000 });
  42 | }
  43 | 
  44 | export async function logOut(page: Page, user: TestUser) {
  45 |   await page.goto(`/owners/${user.username}`);
  46 |   await page.locator('button[aria-label="Log out"]').click();
  47 |   await page.waitForLoadState("networkidle");
  48 | }
  49 | 
  50 | /** A tiny valid PNG on disk, for upload inputs. */
  51 | export function tinyPng() {
  52 |   const p = path.join(os.tmpdir(), `petsocial-test-${Date.now()}.png`);
  53 |   fs.writeFileSync(
  54 |     p,
  55 |     Buffer.from(
  56 |       "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAWklEQVR42u3QMQEAAAgDINc/9Kzg" +
  57 |         "AwmQqrZ3AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  58 |         "AAAAAAAAAAAAAAAAgLcFVngAAWjBudsAAAAASUVORK5CYII=",
  59 |       "base64"
  60 |     )
  61 |   );
  62 |   return p;
  63 | }
  64 | 
  65 | export async function createPet(page: Page, name: string, species = "Dog", breed = "Corgi") {
  66 |   await page.goto("/pets/new");
  67 |   await page.fill('input[name="name"]', name);
  68 |   await page.fill('input[name="species"]', species);
  69 |   await page.fill('input[name="breed"]', breed);
  70 |   await page.locator("main button[type=submit]").click();
  71 |   await page.waitForLoadState("networkidle");
  72 |   await expect(page).not.toHaveURL(/\/pets\/new/);
  73 | }
  74 | 
  75 | export async function createPost(page: Page, caption: string, opts: { image?: boolean } = {}) {
  76 |   await page.goto("/posts/new");
  77 |   await page.fill('textarea[name="caption"]', caption);
  78 |   if (opts.image) {
  79 |     await page.locator('input[type="file"]').setInputFiles(tinyPng());
  80 |     await page.waitForFunction(
  81 |       () => (document.querySelector('input[name="mediaUrl"]') as HTMLInputElement)?.value.length > 0,
  82 |       undefined,
  83 |       { timeout: 45_000 }
  84 |     );
  85 |   }
  86 |   await page.locator("main button[type=submit]").click();
  87 |   await page.waitForLoadState("networkidle");
  88 |   await expect(page).not.toHaveURL(/\/posts\/new/);
  89 | }
  90 | 
  91 | export async function setPrivate(page: Page, user: TestUser, isPrivate: boolean) {
  92 |   await page.goto(`/owners/${user.username}/edit`);
  93 |   const box = page.locator('input[name="isPrivate"]');
  94 |   if (isPrivate) await box.check();
  95 |   else await box.uncheck();
  96 |   await page.locator("main button[type=submit]").click();
  97 |   await page.waitForLoadState("networkidle");
  98 | }
  99 | 
```