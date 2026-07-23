"use client";

import { useTransition } from "react";
import { toggleListingSold } from "@/app/actions/marketplace";
import { Button } from "@/components/ui/button";

export function SoldButton({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const isSold = status === "sold";

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleListingSold(id);
        })
      }
    >
      {pending ? "Updating..." : isSold ? "Mark available" : "Mark sold"}
    </Button>
  );
}
