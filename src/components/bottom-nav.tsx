"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";

export function BottomNav({
  username,
  displayName,
  avatarUrl,
  unreadCount,
}: {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/feed" ? pathname === "/feed" : pathname.startsWith(href));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-border bg-background/90 px-2 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-2 backdrop-blur"
      aria-label="Primary"
    >
      <Link
        href="/feed"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${isActive("/feed") ? "text-primary" : "text-muted"}`}
      >
        <Icon name="home" className="h-6 w-6" filled={isActive("/feed")} />
        Home
      </Link>
      <Link
        href="/explore"
        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${isActive("/explore") ? "text-primary" : "text-muted"}`}
      >
        <Icon name="compass" className="h-6 w-6" />
        Explore
      </Link>
      <Link href="/posts/new" className="-mt-6 flex flex-col items-center gap-1">
        <span className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary text-primary-foreground shadow-lg">
          <Icon name="plus" className="h-6 w-6" />
        </span>
      </Link>
      <Link
        href="/notifications"
        className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${isActive("/notifications") ? "text-primary" : "text-muted"}`}
      >
        <Icon name="bell" className="h-6 w-6" filled={isActive("/notifications")} />
        Activity
        {unreadCount > 0 && (
          <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </Link>
      <Link
        href={`/owners/${username}`}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-semibold ${isActive(`/owners/${username}`) ? "text-primary" : "text-muted"}`}
      >
        <Avatar name={displayName} src={avatarUrl} size="sm" />
        Profile
      </Link>
    </nav>
  );
}
