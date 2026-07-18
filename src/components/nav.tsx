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
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-lg font-semibold text-primary">
          🐾 PetSocial
        </Link>

        {owner ? (
          <div className="flex min-w-0 items-center gap-1">
            <div className="flex items-center gap-1 overflow-x-auto text-sm whitespace-nowrap">
              <Link href="/feed" className="rounded-md px-2 py-1.5 hover:bg-muted-bg">
                Feed
              </Link>
              <Link href="/explore" className="rounded-md px-2 py-1.5 hover:bg-muted-bg">
                Explore
              </Link>
              <Link href="/communities" className="rounded-md px-2 py-1.5 hover:bg-muted-bg">
                Communities
              </Link>
              <Link href="/lost-found" className="rounded-md px-2 py-1.5 hover:bg-muted-bg">
                Lost & Found
              </Link>
              <Link href="/notifications" className="relative rounded-md px-2 py-1.5 hover:bg-muted-bg">
                Alerts
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            <Link href="/posts/new" className="shrink-0">
              <Button className="ml-1">New post</Button>
            </Link>

            <Link
              href={`/owners/${owner.username}`}
              className="ml-1 shrink-0"
              title={owner.displayName}
            >
              <Avatar name={owner.displayName} size="sm" />
            </Link>

            <form action={logout} className="shrink-0">
              <button type="submit" className="px-2 text-sm text-muted hover:text-foreground">
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-muted hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
