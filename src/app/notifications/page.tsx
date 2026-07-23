import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";

const ICONS: Record<string, { name: Parameters<typeof Icon>[0]["name"]; className: string }> = {
  like: { name: "heart", className: "text-danger" },
  comment: { name: "comment", className: "text-primary" },
  follow: { name: "user", className: "text-success" },
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
    <main className="mx-auto flex w-full min-h-[calc(100vh-65px)] max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <Button type="submit" variant="secondary">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 && <EmptyState>No notifications yet.</EmptyState>}

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-md border border-border px-4 py-3 text-sm ${n.isRead ? "" : "bg-muted-bg"}`}
          >
            <Icon
              name={ICONS[n.type]?.name ?? "bell"}
              className={`h-5 w-5 shrink-0 ${ICONS[n.type]?.className ?? "text-muted"}`}
              filled={n.type === "like"}
            />
            <div>
              <p>{n.message}</p>
              <p className="mt-1 text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
