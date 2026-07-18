"use client";

import { useActionState } from "react";
import { createLostFoundPost } from "@/app/actions/lost-found";
import { Select, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function LostFoundForm({ pets }: { pets: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createLostFoundPost(formData);
    return result ?? initialState;
  }, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Select name="status" defaultValue="lost">
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </Select>

      {pets.length > 0 && (
        <Select name="petId">
          <option value="">Not one of my pets</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </Select>
      )}

      <Textarea
        name="description"
        placeholder="Description (where/when last seen, distinguishing features, etc.)"
        rows={4}
        required
      />
      <Input name="contactInfo" type="text" placeholder="Contact info (phone, email, etc.)" />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post report"}
      </Button>
    </form>
  );
}
