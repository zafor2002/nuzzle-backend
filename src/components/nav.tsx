import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const owner = user
    ? await prisma.owner.findUnique({ where: { id: user.id }, select: { username: true } })
    : null;

  const unreadCount = user
    ? await prisma.notification.count({ where: { ownerId: user.id, isRead: false } })
    : 0;

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-black/80">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          PetSocial
        </Link>

        {owner ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/feed">Feed</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/lost-found">Lost & Found</Link>
            <Link href="/posts/new">New post</Link>
            <Link href="/notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href={`/owners/${owner.username}`}>Profile</Link>
            <form action={logout}>
              <button type="submit" className="text-gray-500">
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="rounded bg-black px-3 py-1.5 text-white">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
