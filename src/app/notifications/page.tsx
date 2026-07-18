import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { markAllRead } from "@/app/actions/notifications";

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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {hasUnread && (
          <form action={markAllRead}>
            <button type="submit" className="rounded border px-3 py-1.5 text-sm">
              Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 && <p className="text-gray-500">No notifications yet.</p>}

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded border px-4 py-3 text-sm ${n.isRead ? "" : "bg-gray-50 dark:bg-gray-900"}`}
          >
            <p>{n.message}</p>
            <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
