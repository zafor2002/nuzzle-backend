import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Deletes every row created by accounts named `uitest%`. Ordered child-first
 * because the tests run against the real database, not a throwaway one.
 *
 * Note: this removes application rows only. The matching Supabase Auth users
 * are left behind — deleting those needs a service-role key, which the app's
 * env deliberately does not carry.
 */
const SQL = `
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Appointment" WHERE "ownerId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "MarketplaceListing" WHERE "sellerId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "AdoptionListing" WHERE "posterId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "LostFoundPost" WHERE "ownerId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "HealthLog" WHERE "petId" IN (SELECT id FROM "Pet" WHERE "ownerId" IN (SELECT id FROM t));
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "HashtagsOnPosts" WHERE "postId" IN (SELECT id FROM "Post" WHERE "ownerId" IN (SELECT id FROM t));
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Comment" WHERE "ownerId" IN (SELECT id FROM t)
   OR "postId" IN (SELECT id FROM "Post" WHERE "ownerId" IN (SELECT id FROM t));
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Like" WHERE "ownerId" IN (SELECT id FROM t)
   OR "postId" IN (SELECT id FROM "Post" WHERE "ownerId" IN (SELECT id FROM t));
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Message" WHERE "senderId" IN (SELECT id FROM t) OR "receiverId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Notification" WHERE "ownerId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Follow" WHERE "followerId" IN (SELECT id FROM t) OR "followingId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Post" WHERE "ownerId" IN (SELECT id FROM t);
WITH t AS (SELECT id FROM "Owner" WHERE username LIKE 'uitest%')
DELETE FROM "Pet" WHERE "ownerId" IN (SELECT id FROM t);
DELETE FROM "Owner" WHERE username LIKE 'uitest%';
DELETE FROM "Hashtag" WHERE id NOT IN (SELECT DISTINCT "hashtagId" FROM "HashtagsOnPosts");
`;

export default async function globalTeardown() {
  const file = path.join(os.tmpdir(), `petsocial-teardown-${Date.now()}.sql`);
  fs.writeFileSync(file, SQL);
  try {
    execFileSync("npx", ["prisma", "db", "execute", "--file", file], {
      stdio: "pipe",
      shell: process.platform === "win32",
    });
    console.log("\n[teardown] test data removed");
  } catch (err) {
    console.error("\n[teardown] FAILED — test rows may remain:", (err as Error).message);
    throw err;
  } finally {
    fs.unlinkSync(file);
  }
}
