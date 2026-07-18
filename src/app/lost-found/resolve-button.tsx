"use client";

import { useTransition } from "react";
import { markResolved } from "@/app/actions/lost-found";
import { Button } from "@/components/ui/button";

export function ResolveButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => markResolved(id))}
      className="self-start"
    >
      {pending ? "Updating..." : "Mark resolved"}
    </Button>
  );
}
