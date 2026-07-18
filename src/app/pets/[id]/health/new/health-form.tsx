"use client";

import { useActionState } from "react";
import { createHealthLog } from "@/app/actions/health";
import { Select, Input, Field, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function HealthForm({ petId }: { petId: string }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createHealthLog(petId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Select name="type" required defaultValue="vaccination">
        <option value="vaccination">Vaccination</option>
        <option value="vet_visit">Vet visit</option>
        <option value="medication">Medication</option>
        <option value="other">Other</option>
      </Select>

      <Input name="title" type="text" placeholder="Title (e.g. Rabies shot)" required />

      <Field label="Date">
        <Input name="date" type="date" required />
      </Field>

      <Field label="Reminder (optional)">
        <Input name="reminderAt" type="date" />
      </Field>

      <Textarea name="notes" placeholder="Notes (optional)" rows={3} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Add health log"}
      </Button>
    </form>
  );
}
