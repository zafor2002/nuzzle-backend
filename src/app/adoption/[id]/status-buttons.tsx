"use client";

import { useTransition } from "react";
import { updateListingStatus } from "@/app/actions/adoption";
import { Button } from "@/components/ui/button";

const OPTIONS = ["available", "pending", "adopted"] as const;

export function StatusButtons({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          variant={status === option ? "primary" : "secondary"}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateListingStatus(id, option);
            })
          }
          className="capitalize"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
