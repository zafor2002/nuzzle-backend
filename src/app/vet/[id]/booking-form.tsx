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
  slots,
}: {
  vetId: string;
  date: string;
  pets: { id: string; name: string }[];
  /** Every slot for the day; `available: false` ones are shown struck through. */
  slots: { time: string; available: boolean }[];
}) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await bookAppointment(vetId, formData);
    return result ?? initialState;
  }, initialState);

  const firstAvailable = slots.find((s) => s.available);

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

      <fieldset>
        <legend className="mb-1.5 text-[12.5px] font-semibold text-muted">Time</legend>
        {firstAvailable ? (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <label key={slot.time} className={slot.available ? "cursor-pointer" : "cursor-not-allowed"}>
                <input
                  type="radio"
                  name="time"
                  value={slot.time}
                  required
                  disabled={!slot.available}
                  defaultChecked={slot.time === firstAvailable.time}
                  className="peer sr-only"
                />
                <span
                  className={`flex h-11 items-center justify-center rounded-xl border-[1.5px] text-[13px] font-semibold transition-colors ${
                    slot.available
                      ? "border-border bg-card peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground"
                      : "border-transparent bg-muted-bg text-muted/60 line-through"
                  }`}
                >
                  {slot.time}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border px-3.5 py-3 text-sm text-muted">
            No slots left on this day — try another date.
          </p>
        )}
      </fieldset>

      <Textarea name="notes" placeholder="Notes for the vet (optional)" rows={3} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending || !firstAvailable}>
        {pending ? "Booking..." : "Confirm booking"}
      </Button>
    </form>
  );
}
