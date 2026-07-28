import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Shell } from "@/components/shell";
import { RealtimeMessages } from "@/components/realtime-messages";
import { MessageForm } from "./message-form";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const other = await prisma.owner.findUnique({ where: { username } });
  if (!other) {
    notFound();
  }
  if (other.id === user.id) {
    redirect("/messages");
  }

  await prisma.message.updateMany({
    where: { senderId: other.id, receiverId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: other.id },
        { senderId: other.id, receiverId: user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  const displayName = other.isAnonymous ? "Anonymous" : other.displayName;

  return (
    <Shell>
      <div className="flex h-[calc(100vh-140px)] flex-col gap-3">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Link
            href="/messages"
            aria-label="Back to messages"
            className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-muted-bg"
          >
            <Icon name="back" className="h-5 w-5" />
          </Link>
          <Link href={`/owners/${other.username}`} className="flex min-w-0 items-center gap-2.5">
            <Avatar name={displayName} src={other.isAnonymous ? null : other.avatarUrl} size="sm" />
            <p className="truncate text-sm font-bold">{displayName}</p>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto py-1">
          {messages.length === 0 && (
            <p className="m-auto text-sm text-muted">Say hello to {displayName}.</p>
          )}
          {messages.map((m) => {
            const isMine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`max-w-[74%] rounded-[18px] px-3.5 py-2.5 text-[13.5px] leading-snug ${
                  isMine
                    ? "self-end rounded-br-md bg-primary text-primary-foreground"
                    : "self-start rounded-bl-md border border-border bg-card"
                }`}
              >
                {m.body}
              </div>
            );
          })}
        </div>

        <MessageForm receiverId={other.id} />
        <RealtimeMessages ownerId={user.id} otherId={other.id} />
      </div>
    </Shell>
  );
}
