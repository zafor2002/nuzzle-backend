import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { visiblePostWhere } from "@/lib/privacy";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
import { PostCard } from "@/components/post-card";
import { Shell } from "@/components/shell";

const TABS = ["all", "people", "pets", "tags", "posts"] as const;
type Tab = (typeof TABS)[number];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab: tabParam } = await searchParams;
  const query = q?.trim() ?? "";
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "all";
  const show = (t: Tab) => tab === "all" || tab === t;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const like = { contains: query, mode: "insensitive" as const };
  const postVisibility = await visiblePostWhere(user?.id);

  const [owners, pets, tags, posts] = query
    ? await Promise.all([
        show("people")
          ? prisma.owner.findMany({
              where: {
                isAnonymous: false,
                OR: [{ displayName: like }, { username: like }],
              },
              take: tab === "all" ? 5 : 30,
              orderBy: { createdAt: "desc" },
            })
          : [],
        show("pets")
          ? prisma.pet.findMany({
              where: {
                isAnonymous: false,
                OR: [{ name: like }, { breed: like }, { species: like }],
              },
              take: tab === "all" ? 5 : 30,
              orderBy: { createdAt: "desc" },
            })
          : [],
        show("tags")
          ? prisma.hashtag.findMany({
              where: { tag: { contains: query.replace(/^#/, "").toLowerCase() } },
              take: tab === "all" ? 5 : 30,
              include: { _count: { select: { posts: true } } },
              orderBy: { posts: { _count: "desc" } },
            })
          : [],
        show("posts")
          ? prisma.post.findMany({
              where: { AND: [{ caption: like }, postVisibility] },
              take: tab === "all" ? 3 : 20,
              orderBy: { createdAt: "desc" },
              include: {
                owner: true,
                pet: true,
                _count: { select: { likes: true, comments: true } },
                likes: { where: { ownerId: user?.id ?? "__none__" }, select: { ownerId: true } },
              },
            })
          : [],
      ])
    : [[], [], [], []];

  const total = owners.length + pets.length + tags.length + posts.length;

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader title="Search" back="/explore" />

        <form action="/search" className="flex h-11 items-center gap-2 rounded-[14px] bg-muted-bg px-3.5">
          <Icon name="search" className="h-[18px] w-[18px] shrink-0 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="People, pets, #tags, captions…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <input type="hidden" name="tab" value={tab} />
        </form>

        {query && (
          <FilterChips
            active={tab}
            options={[
              { label: "All", value: "all" },
              { label: "People", value: "people" },
              { label: "Pets", value: "pets" },
              { label: "Tags", value: "tags" },
              { label: "Posts", value: "posts" },
            ]}
            hrefFor={(v) => `/search?q=${encodeURIComponent(query)}&tab=${v}`}
          />
        )}

        {!query && (
          <EmptyState icon="search" title="Search PetSocial">
            Find people, pets, hashtags, or words in captions.
          </EmptyState>
        )}

        {query && total === 0 && (
          <EmptyState icon="search" title="No results">
            Nothing matching “{query}”.
          </EmptyState>
        )}

        {tags.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-bold text-muted">Hashtags</h2>
            <div className="flex flex-col gap-2">
              {tags.map((t) => (
                <Link key={t.id} href={`/hashtags/${encodeURIComponent(t.tag)}`}>
                  <Card padded={false} className="flex items-center gap-3 p-3 hover:bg-muted-bg">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted-bg text-lg font-bold text-primary">
                      #
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">#{t.tag}</p>
                      <p className="text-[11.5px] text-muted">
                        {t._count.posts} {t._count.posts === 1 ? "post" : "posts"}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {owners.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-bold text-muted">People</h2>
            <div className="flex flex-col gap-2">
              {owners.map((o) => (
                <Link key={o.id} href={`/owners/${o.username}`}>
                  <Card padded={false} className="flex items-center gap-3 p-3 hover:bg-muted-bg">
                    <Avatar name={o.displayName} src={o.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{o.displayName}</p>
                      <p className="truncate text-[11.5px] text-muted">
                        @{o.username}
                        {o.isPrivate ? " · private" : ""}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {pets.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-bold text-muted">Pets</h2>
            <div className="flex flex-col gap-2">
              {pets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card padded={false} className="flex items-center gap-3 p-3 hover:bg-muted-bg">
                    <Avatar name={pet.name} src={pet.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{pet.name}</p>
                      <p className="truncate text-[11.5px] text-muted">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts.length > 0 && (
          <section>
            <h2 className="mb-2 text-[13px] font-bold text-muted">Posts</h2>
            <div className="flex flex-col gap-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Shell>
  );
}
