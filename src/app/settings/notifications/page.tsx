import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationsForm } from "./notifications-form";

export default async function NotificationSettingsPage() {
  const user = await requireUser();
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: user.id },
    select: { notifyLikes: true, notifyComments: true, notifyFollows: true },
  });

  return (
    <Shell>
      <PageHeader title="Notifications" back="/settings" />
      <p className="mb-3 mt-1 text-[12.5px] leading-relaxed text-muted">
        Switching one off stops the notification being created at all, so it will not appear on
        your activity screen or count towards the unread badge. Direct messages always come
        through.
      </p>
      <NotificationsForm
        notifyLikes={owner.notifyLikes}
        notifyComments={owner.notifyComments}
        notifyFollows={owner.notifyFollows}
      />
    </Shell>
  );
}
