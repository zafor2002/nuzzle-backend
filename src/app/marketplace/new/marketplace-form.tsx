"use client";

import { useActionState, useState } from "react";
import { createMarketplaceListing } from "@/app/actions/marketplace";
import { createClient } from "@/utils/supabase/client";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };
const BUCKET = "post-media";

const CATEGORIES = ["food", "toys", "beds", "health", "accessories", "other"];

export function MarketplaceForm({ ownerId }: { ownerId: string }) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createMarketplaceListing(formData);
    return result ?? initialState;
  }, initialState);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const path = `marketplace/${ownerId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file);

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setMediaUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="title" type="text" placeholder="What are you selling?" required />
      <div className="flex gap-3">
        <Field label="Category">
          <Select name="category" defaultValue="other">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Price ($)">
          <Input name="price" type="number" step="0.01" min="0" placeholder="0.00" required />
        </Field>
      </div>
      <Textarea name="description" placeholder="Condition, details..." rows={4} required />
      <Input name="location" type="text" placeholder="Location (optional)" />

      <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
      {uploading && <p className="text-sm text-muted">Uploading...</p>}
      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      {mediaUrl && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="Preview" className="w-full rounded-md object-cover" />
      )}
      <input type="hidden" name="mediaUrl" value={mediaUrl} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Posting..." : "Post listing"}
      </Button>
    </form>
  );
}
