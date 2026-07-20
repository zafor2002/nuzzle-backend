import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

const NAV_LINKS = [
  { href: "/feed", label: "🏠 Home" },
  { href: "/explore", label: "🔎 Explore" },
  { href: "/lost-found", label: "🚨 Lost & Found" },
  { href: "/notifications", label: "🔔 Alerts" },
];

export async function LeftSidebar() {
  const groups = await prisma.pet.groupBy({
    by: ["species"],
    _count: { _all: true },
    orderBy: { _count: { species: "desc" } },
    take: 8,
  });

  return (
    <div className="sticky top-[65px] flex flex-col gap-3">
      <Card className="flex flex-col gap-0.5 p-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted-bg"
          >
            {link.label}
          </Link>
        ))}
      </Card>

      {groups.length > 0 && (
        <Card className="flex flex-col gap-0.5 p-2">
          <p className="px-3 py-1 text-xs font-semibold uppercase text-muted">Communities</p>
          {groups.map((group) => (
            <Link
              key={group.species}
              href={`/communities/${encodeURIComponent(group.species)}`}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm hover:bg-muted-bg"
            >
              <span>🐾 {group.species}</span>
              <span className="text-xs text-muted">{group._count._all}</span>
            </Link>
          ))}
          <Link
            href="/communities"
            className="rounded-md px-3 py-1.5 text-sm text-primary hover:bg-muted-bg"
          >
            See all
          </Link>
        </Card>
      )}
    </div>
  );
}
