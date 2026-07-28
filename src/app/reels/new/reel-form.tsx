"use client";

import { useActionState, useState } from "react";
import { createReel } from "@/app/actions/reels";
import { createClient } from "@/utils/supabase/client";
import {
  MEDIA_BUCKET,
  MAX_VIDEO_SECONDS,
  readVideoDuration,
  validateVideoFile,
} from "@/lib/media";
import { Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { error: "" };

export function ReelForm({
  ownerId,
  pets,
}: {
  ownerId: string;
  pets: { id: string; name: string }[];
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const result = await createReel(formData);
      return result ?? initialState;
    },
    initialState
  );

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const invalid = validateVideoFile(file);
    if (invalid) {
      setUploadError(invalid);
      e.target.value = "";
      return;
    }

    // Size alone does not bound length — a highly compressed clip can be long.
    try {
      const seconds = await readVideoDuration(file);
      if (seconds > MAX_VIDEO_SECONDS) {
        setUploadError(
          `That video is ${Math.round(seconds)}s — the limit is ${MAX_VIDEO_SECONDS}s.`
        );
        e.target.value = "";
        return;
      }
    } catch {
      setUploadError("Could not read that video. Try a different file.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const path = `reels/${ownerId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file);

    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    setVideoUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {pets.length > 0 && (
        <Select name="petId">
          <option value="">Post as yourself</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              Post as {pet.name}
            </option>
          ))}
        </Select>
      )}

      <input
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        className="text-xs"
      />
      {uploading && <p className="text-sm text-muted">Uploading…</p>}
      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      {videoUrl && !uploading && (
        <video src={videoUrl} className="w-full rounded-md" controls playsInline />
      )}
      <input type="hidden" name="videoUrl" value={videoUrl} />

      <Textarea name="caption" placeholder="Caption (optional) — #hashtags work here" rows={3} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading || !videoUrl}>
        {pending ? "Posting…" : "Post reel"}
      </Button>
    </form>
  );
}
