import { prisma } from "@/lib/prisma";

/** Notification types that can be switched off, mapped to their Owner column. */
const PREF_COLUMN = {
  like: "notifyLikes",
  comment: "notifyComments",
  follow: "notifyFollows",
} as const;

export type NotifiableType = keyof typeof PREF_COLUMN;

/**
 * Writes a notification unless the recipient has switched that type off.
 *
 * The check lives here rather than on the notifications screen on purpose: a
 * preference that only hides rows still leaks — the unread badge in the top bar
 * and bottom nav counts straight from the table, so a muted "like" would still
 * light it up. Dropping the write is the only place the setting is actually
 * honoured everywhere at once.
 *
 * A type not listed in PREF_COLUMN is always delivered, so adding a new
 * notification kind can never be silently suppressed by a missing preference.
 */
export async function notify(ownerId: string, type: string, message: string) {
  const column = PREF_COLUMN[type as NotifiableType];

  if (column) {
    const prefs = await prisma.owner.findUnique({
      where: { id: ownerId },
      select: { notifyLikes: true, notifyComments: true, notifyFollows: true },
    });
    if (prefs && prefs[column] === false) {
      return;
    }
  }

  await prisma.notification.create({ data: { ownerId, type, message } });
}

export async function actorLabel(actorId: string): Promise<string> {
  const actor = await prisma.owner.findUnique({ where: { id: actorId } });
  if (!actor || actor.isAnonymous) {
    return "Someone";
  }
  return actor.displayName;
}
