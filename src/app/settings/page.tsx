import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Icon, type IconName } from "@/components/ui/icon";
import { logout } from "@/app/actions/auth";

const SECTIONS: { href: string; icon: IconName; title: string; detail: string }[] = [
  {
    href: "/settings/account",
    icon: "user",
    title: "Account",
    detail: "Email and password",
  },
  {
    href: "/settings/privacy",
    icon: "lock",
    title: "Privacy",
    detail: "Private account and anonymity",
  },
  {
    href: "/settings/notifications",
    icon: "bell",
    title: "Notifications",
    detail: "Choose what you get told about",
  },
];

export default async function SettingsPage() {
  const user = await requireUser();
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: user.id },
    select: { username: true, displayName: true, avatarUrl: true, isAnonymous: true },
  });

  const displayName = owner.isAnonymous ? "Anonymous" : owner.displayName;

  return (
    <Shell>
      <PageHeader title="Settings" back={`/owners/${owner.username}`} />

      <Link
        href={`/owners/${owner.username}/edit`}
        className="mt-2 flex items-center gap-3 rounded-md border border-border bg-card p-3.5 transition-colors hover:bg-muted-bg"
      >
        <Avatar
          name={displayName}
          src={owner.isAnonymous ? null : owner.avatarUrl}
          size="lg"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{displayName}</span>
          <span className="mt-0.5 block truncate text-[11.5px] text-muted">
            @{owner.username}
            {" · "}
            Edit profile
          </span>
        </span>
        <Icon name="back" className="h-4 w-4 shrink-0 rotate-180 text-muted" />
      </Link>

      <div className="mt-4 flex flex-col gap-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center gap-3 rounded-md border border-border bg-card p-3.5 transition-colors hover:bg-muted-bg"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted-bg text-foreground">
              <Icon name={section.icon} className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{section.title}</span>
              <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                {section.detail}
              </span>
            </span>
            <Icon name="back" className="h-4 w-4 shrink-0 rotate-180 text-muted" />
          </Link>
        ))}
      </div>

      <form action={logout} className="mt-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-3.5 text-left transition-colors hover:bg-muted-bg"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted-bg text-danger">
            <Icon name="logout" className="h-[18px] w-[18px]" />
          </span>
          <span className="text-sm font-bold text-danger">Log out</span>
        </button>
      </form>
    </Shell>
  );
}
