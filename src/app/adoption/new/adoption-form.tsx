"use client";

import { useActionState, useState } from "react";
import { createAdoptionListing } from "@/app/actions/adoption";
import { createClient } from "@/utils/supabase/client";
import { MEDIA_BUCKET, validateImageFile } from "@/lib/media";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };
export function AdoptionForm({ ownerId }: { ownerId: string }) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createAdoptionListing(formData);
    return result ?? initialState;
  }, initialState);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setUploadError(invalid);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const path = `adoption/${ownerId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file);

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    setMediaUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="name" type="text" placeholder="Pet's name" required />
      <Input name="species" type="text" placeholder="Species (e.g. Dog, Cat)" required />
      <Input name="breed" type="text" placeholder="Breed (optional)" />
      <div className="flex gap-3">
        <Input name="age" type="text" placeholder="Age (e.g. 1.5 yrs)" className="flex-1" />
        <Select name="gender" defaultValue="unknown" className="flex-1">
          <option value="unknown">Unknown</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </Select>
      </div>
      <Textarea name="description" placeholder="Description, temperament, needs..." rows={4} required />
      <Input name="location" type="text" placeholder="Location (city, shelter name)" />
      <Input name="contactInfo" type="text" placeholder="Contact info (phone, email)" />

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
