import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = user
    ? await prisma.owner.findUnique({ where: { id: user.id }, select: { username: true, displayName: true } })
    : null;

  const unreadCount = user
    ? await prisma.notification.count({ where: { ownerId: user.id, isRead: false } })
    : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-semibold text-primary">
          🐾 PetSocial
        </Link>

        {owner ? (
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/posts/new">
              <Button className="px-3 py-1.5 text-sm">New post</Button>
            </Link>
            <Link href={`/owners/${owner.username}`} title={owner.displayName}>
              <Avatar name={owner.displayName} size="sm" />
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-muted hover:text-foreground">
                Log out
              </button>
            </form>
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

      {owner && (
        <nav className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-2 text-sm whitespace-nowrap">
          <Link href="/feed" className="shrink-0 rounded-md px-2 py-1 hover:bg-muted-bg">
            Feed
          </Link>
          <Link href="/explore" className="shrink-0 rounded-md px-2 py-1 hover:bg-muted-bg">
            Explore
          </Link>
          <Link href="/communities" className="shrink-0 rounded-md px-2 py-1 hover:bg-muted-bg">
            Communities
          </Link>
          <Link href="/lost-found" className="shrink-0 rounded-md px-2 py-1 hover:bg-muted-bg">
            Lost & Found
          </Link>
          <Link href="/notifications" className="relative shrink-0 rounded-md px-2 py-1 hover:bg-muted-bg">
            Alerts
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>
      )}
    </header>
  );
}
