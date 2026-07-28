"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Live message delivery.
 *
 * The payload is deliberately ignored — this only asks the server to re-render,
 * so the message list stays a Server Component and anonymity/visibility rules
 * keep being applied server-side. Supabase Realtime evaluates RLS as the
 * subscribing user, and the Message policy only exposes rows where they are the
 * sender or receiver, so nobody is notified about a conversation they are not in.
 */
export function RealtimeMessages({
  ownerId,
  otherId,
}: {
  ownerId: string;
  /** When set, only refresh for messages in this conversation. */
  otherId?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${ownerId}${otherId ? `:${otherId}` : ""}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `receiverId=eq.${ownerId}`,
        },
        (payload) => {
          const senderId = (payload.new as { senderId?: string } | null)?.senderId;
          if (otherId && senderId && senderId !== otherId) return;
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId, otherId, router]);

  return null;
}
