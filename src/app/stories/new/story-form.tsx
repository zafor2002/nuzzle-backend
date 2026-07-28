"use client";

import { useActionState, useState } from "react";
import { createStory } from "@/app/actions/stories";
import { createClient } from "@/utils/supabase/client";
import { MEDIA_BUCKET, validateImageFile } from "@/lib/media";
import { Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function StoryForm({
  ownerId,
  pets,
}: {
  ownerId: string;
  pets: { id: string; name: string }[];
}) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createStory(formData);
      return result ?? initialState;
    },
    initialState
  );

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
    const path = `stories/${ownerId}/${crypto.randomUUID()}-${file.name}`;
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
      {pets.length > 0 && (
        <Select name="petId">
          <option value="">Share as yourself</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              Share as {pet.name}
            </option>
          ))}
        </Select>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
      {uploading && <p className="text-sm text-muted">Uploading…</p>}
      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {mediaUrl && !uploading && <img src={mediaUrl} alt="" className="w-full rounded-md" />}
      <input type="hidden" name="mediaUrl" value={mediaUrl} />

      <Textarea name="caption" placeholder="Say something (optional)" rows={2} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading || !mediaUrl}>
        {pending ? "Sharing…" : "Share to story"}
      </Button>
    </form>
  );
}
