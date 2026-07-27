import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { BottomNav } from "@/components/bottom-nav";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = user
    ? await prisma.owner.findUnique({
        where: { id: user.id },
        select: { username: true, displayName: true, avatarUrl: true, isAnonymous: true },
      })
    : null;

  const unreadCount = user
    ? await prisma.notification.count({ where: { ownerId: user.id, isRead: false } })
    : 0;

  const unreadMessages = user
    ? await prisma.message.count({ where: { receiverId: user.id, readAt: null } })
    : 0;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 text-[19px] font-extrabold text-primary">
            <Icon name="pawprint" className="h-6 w-6" filled />
            PetSocial
          </Link>

          {owner ? (
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/messages"
                aria-label="Messages"
                className="relative flex h-[34px] w-[34px] items-center justify-center rounded-xl text-foreground hover:bg-muted-bg"
              >
                <Icon name="chat" className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                href="/notifications"
                aria-label="Activity"
                className="relative flex h-[34px] w-[34px] items-center justify-center rounded-xl text-foreground hover:bg-muted-bg"
              >
                <Icon name="bell" className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <Link href="/login" className="text-muted hover:text-foreground">
                Log in
              </Link>
              <Link href="/signup">
                <Button className="px-3 py-1.5 text-sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {owner && (
        <BottomNav
          username={owner.username}
          displayName={owner.displayName}
          avatarUrl={owner.isAnonymous ? null : owner.avatarUrl}
          unreadCount={unreadCount}
        />
      )}
    </>
  );
}
