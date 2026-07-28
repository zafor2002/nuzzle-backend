-- Real-time direct messages.
--
-- The app reads through Prisma as the `postgres` role, which has BYPASSRLS, so
-- these policies do not affect server-side queries. They exist only so Supabase
-- Realtime — which evaluates RLS as the subscribing user — can deliver a change
-- event to the two people in a conversation and nobody else.

-- Realtime needs the full old/new row to evaluate policies and filters.
ALTER TABLE "Message" REPLICA IDENTITY FULL;

-- Only the sender or the receiver may read a message.
DROP POLICY IF EXISTS "message_participants_can_read" ON "Message";
CREATE POLICY "message_participants_can_read" ON "Message"
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid())::text IN ("senderId", "receiverId"));

-- Add to the realtime publication, idempotently: ALTER PUBLICATION ... ADD TABLE
-- errors if the table is already a member.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'Message'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
  END IF;
END
$$;
