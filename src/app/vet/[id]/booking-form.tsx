"use client";

import { useActionState } from "react";
import { bookAppointment } from "@/app/actions/vet";
import { Select, Textarea, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

const REASONS = ["Wellness check", "Vaccines", "Skin/coat", "Dental", "Other"];

export function BookingForm({
  vetId,
  date,
  pets,
  availableTimes,
}: {
  vetId: string;
  date: string;
  pets: { id: string; name: string }[];
  availableTimes: string[];
}) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await bookAppointment(vetId, formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="date" value={date} />

      <Field label="Patient">
        <Select name="petId" required>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Reason for visit">
        <Select name="reason" required defaultValue={REASONS[0]}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Time">
        {availableTimes.length > 0 ? (
          <Select name="time" required>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        ) : (
          <p className="rounded-md border border-border px-3 py-2 text-sm text-muted">
            No slots available on this day.
          </p>
        )}
      </Field>

      <Textarea name="notes" placeholder="Notes for the vet (optional)" rows={3} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending || availableTimes.length === 0}>
        {pending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}
