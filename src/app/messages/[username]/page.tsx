import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Shell } from "@/components/shell";
import { LeftSidebar } from "@/components/left-sidebar";
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
    <Shell left={<LeftSidebar />}>
      <div className="flex h-[calc(100vh-97px)] flex-col gap-3 lg:h-[calc(100vh-65px)]">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-sm text-muted hover:text-primary">
            &larr;
          </Link>
          <Avatar name={displayName} src={other.isAnonymous ? null : other.avatarUrl} size="sm" />
          <p className="font-medium">{displayName}</p>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-md border border-border bg-card p-4">
          {messages.length === 0 && (
            <p className="m-auto text-sm text-muted">Say hello to {displayName}.</p>
          )}
          {messages.map((m) => {
            const isMine = m.senderId === user.id;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                  isMine ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted-bg"
                }`}
              >
                {m.body}
              </div>
            );
          })}
        </div>

        <MessageForm receiverId={other.id} />
      </div>
    </Shell>
  );
}
