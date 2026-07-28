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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // The realtime socket authenticates separately from the REST client. Without
      // handing it the user's access token it connects as `anon`, and the Message
      // RLS policy — which only exposes rows to the two participants — correctly
      // refuses to deliver anything.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.realtime.setAuth(data.session.access_token);
      }
      if (cancelled) return;

      channel = supabase
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
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [ownerId, otherId, router]);

  return null;
}
