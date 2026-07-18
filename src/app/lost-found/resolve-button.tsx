"use client";

import { useTransition } from "react";
import { markResolved } from "@/app/actions/lost-found";

export function ResolveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markResolved(id))}
      className="rounded border px-3 py-1 text-sm disabled:opacity-50"
    >
      {pending ? "Updating..." : "Mark resolved"}
    </button>
  );
}
