import { prisma } from "@/lib/prisma";

export async function notify(ownerId: string, type: string, message: string) {
  await prisma.notification.create({ data: { ownerId, type, message } });
}

export async function actorLabel(actorId: string): Promise<string> {
  const actor = await prisma.owner.findUnique({ where: { id: actorId } });
  if (!actor || actor.isAnonymous) {
    return "Someone";
  }
  return actor.displayName;
}
