import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon, type IconName } from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/page-header";
import { Shell } from "@/components/shell";

// Badge colour per notification type, matching the prototype's activity rows.
const KINDS: Record<string, { icon: IconName; bg: string }> = {
  like: { icon: "heart", bg: "bg-danger" },
  comment: { icon: "comment", bg: "bg-primary" },
  follow: { icon: "user", bg: "bg-success" },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Activity"
          action={
            hasUnread ? (
              <form action={markAllRead}>
                <Button type="submit" variant="secondary" size="sm">
                  Mark all read
                </Button>
              </form>
            ) : undefined
          }
        />

        {notifications.length === 0 ? (
          <EmptyState icon="bell" title="Nothing yet">
            Likes, comments and new followers will show up here.
          </EmptyState>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => {
              const kind = KINDS[n.type];
              return (
                <div
                  key={n.id}
                  className={`-mx-4 flex items-start gap-3 border-b border-border px-4 py-3.5 last:border-b-0 ${
                    n.isRead ? "" : "bg-muted-bg/60"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
                      kind?.bg ?? "bg-muted"
                    }`}
                  >
                    <Icon name={kind?.icon ?? "bell"} className="h-[18px] w-[18px]" filled={n.type === "like"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{n.message}</p>
                    <p className="mt-1 text-[11.5px] text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
