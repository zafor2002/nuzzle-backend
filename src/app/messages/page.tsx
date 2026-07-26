import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Shell } from "@/components/shell";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { sender: true, receiver: true },
  });

  const conversations = new Map<
    string,
    { other: (typeof messages)[number]["sender"]; lastMessage: (typeof messages)[number]; unread: number }
  >();

  for (const m of messages) {
    const other = m.senderId === user.id ? m.receiver : m.sender;
    const isUnread = m.receiverId === user.id && m.readAt === null;
    const existing = conversations.get(other.id);
    if (!existing) {
      conversations.set(other.id, { other, lastMessage: m, unread: isUnread ? 1 : 0 });
    } else if (isUnread) {
      existing.unread += 1;
    }
  }

  const list = Array.from(conversations.values());

  return (
    <Shell>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Messages</h1>

        {list.length === 0 && (
          <EmptyState>
            No conversations yet.{" "}
            <Link href="/explore" className="text-primary underline">
              Explore
            </Link>{" "}
            to find someone to message.
          </EmptyState>
        )}

        <div className="flex flex-col gap-2">
          {list.map(({ other, lastMessage, unread }) => {
            const displayName = other.isAnonymous ? "Anonymous" : other.displayName;
            const isMine = lastMessage.senderId === user.id;
            return (
              <Link key={other.id} href={`/messages/${other.username}`}>
                <Card className="flex items-center gap-3">
                  <Avatar name={displayName} src={other.isAnonymous ? null : other.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{displayName}</p>
                    <p className="truncate text-sm text-muted">
                      {isMine ? "You: " : ""}
                      {lastMessage.body}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted">
                      {new Date(lastMessage.createdAt).toLocaleDateString()}
                    </span>
                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-medium text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
