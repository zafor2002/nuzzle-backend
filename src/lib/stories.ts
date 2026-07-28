import { prisma } from "@/lib/prisma";
import { isHidden } from "@/lib/visibility";

/** How long a story stays visible. */
export const STORY_TTL_HOURS = 24;

export type StoryGroup = {
  ownerId: string;
  username: string;
  label: string;
  avatarUrl: string | null;
  isSelf: boolean;
  allSeen: boolean;
  stories: {
    id: string;
    mediaUrl: string;
    caption: string | null;
    createdAt: Date;
    authorLabel: string;
    avatarUrl: string | null;
  }[];
};

/**
 * Live stories from the viewer and the people they follow, grouped by owner.
 *
 * Expiry is enforced in the query (`expiresAt > now`) rather than by a cleanup
 * job, so a story stops being visible exactly 24h after posting whether or not
 * anything has swept the table. Rows still need pruning eventually — see
 * `prisma/README` note — but nothing user-visible depends on that.
 */
export async function getStoryGroups(viewerId: string): Promise<StoryGroup[]> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });

  const ownerIds = [viewerId, ...following.map((f) => f.followingId)];

  const stories = await prisma.story.findMany({
    where: { ownerId: { in: ownerIds }, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "asc" },
    include: {
      owner: true,
      pet: true,
      views: { where: { viewerId }, select: { viewerId: true } },
    },
  });

  const groups = new Map<string, StoryGroup>();

  for (const story of stories) {
    const hidden = isHidden(story.pet, story.owner);
    const authorLabel = hidden
      ? "Anonymous"
      : story.pet
        ? story.pet.name
        : story.owner.displayName;
    const avatarUrl = hidden ? null : story.pet ? story.pet.avatarUrl : story.owner.avatarUrl;

    let group = groups.get(story.ownerId);
    if (!group) {
      group = {
        ownerId: story.ownerId,
        username: story.owner.username,
        label: story.ownerId === viewerId ? "Your story" : authorLabel,
        avatarUrl,
        isSelf: story.ownerId === viewerId,
        allSeen: true,
        stories: [],
      };
      groups.set(story.ownerId, group);
    }

    if (story.views.length === 0) group.allSeen = false;
    group.stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      caption: story.caption,
      createdAt: story.createdAt,
      authorLabel,
      avatarUrl,
    });
  }

  // Own story first, then unseen before seen — the usual story-tray ordering.
  return [...groups.values()].sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    if (a.allSeen !== b.allSeen) return a.allSeen ? 1 : -1;
    return 0;
  });
}
