"use client";

import { useActionState } from "react";
import { createHealthLog } from "@/app/actions/health";

const initialState = { error: "" };

export function HealthForm({ petId }: { petId: string }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createHealthLog(petId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <select name="type" required className="rounded border px-3 py-2" defaultValue="vaccination">
        <option value="vaccination">Vaccination</option>
        <option value="vet_visit">Vet visit</option>
        <option value="medication">Medication</option>
        <option value="other">Other</option>
      </select>

      <input
        name="title"
        type="text"
        placeholder="Title (e.g. Rabies shot)"
        required
        className="rounded border px-3 py-2"
      />

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Date
        <input name="date" type="date" required className="rounded border px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Reminder (optional)
        <input name="reminderAt" type="date" className="rounded border px-3 py-2" />
      </label>

      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={3}
        className="rounded border px-3 py-2"
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Add health log"}
      </button>
    </form>
  );
}
