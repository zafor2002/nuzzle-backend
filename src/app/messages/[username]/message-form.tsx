"use client";

import { useActionState, useRef } from "react";
import { sendMessage } from "@/app/actions/messages";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function MessageForm({ receiverId }: { receiverId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await sendMessage(receiverId, formData);
    if (!result?.error) {
      formRef.current?.reset();
    }
    return result ?? initialState;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <Textarea name="body" placeholder="Message..." rows={1} required className="flex-1 resize-none" />
        <Button type="submit" disabled={pending}>
          {pending ? "Sending..." : "Send"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
