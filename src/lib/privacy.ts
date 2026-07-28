import { prisma } from "@/lib/prisma";

/**
 * Owner.isPrivate: a private owner's posts are visible only to themselves and
 * to accounts they have approved — which, with no follow-request flow, means
 * their existing followers.
 *
 * This returns a Prisma `where` fragment for Post rather than filtering in JS,
 * so private posts are never fetched in the first place. Compose it into any
 * query that surfaces posts to someone other than their author.
 */
export async function visiblePostWhere(viewerId: string | undefined) {
  if (!viewerId) {
    // Signed out: public authors only.
    return { owner: { isPrivate: false } };
  }

  const following = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });

  return {
    OR: [
      { owner: { isPrivate: false } },
      { ownerId: viewerId },
      { ownerId: { in: following.map((f) => f.followingId) } },
    ],
  };
}

/** Whether `viewerId` may see the full profile of a private owner. */
export async function canViewOwner(
  owner: { id: string; isPrivate: boolean },
  viewerId: string | undefined
) {
  if (!owner.isPrivate) return true;
  if (!viewerId) return false;
  if (viewerId === owner.id) return true;

  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: owner.id } },
  });
  return Boolean(follow);
}
