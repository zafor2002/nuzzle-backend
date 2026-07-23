"use client";

import { useTransition } from "react";
import { cancelAppointment } from "@/app/actions/vet";
import { Button } from "@/components/ui/button";

export function CancelButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await cancelAppointment(id);
        })
      }
    >
      {pending ? "Cancelling..." : "Cancel"}
    </Button>
  );
}
