"use client";

import { useActionState, useState } from "react";
import { createPost } from "@/app/actions/posts";
import { createClient } from "@/utils/supabase/client";

const initialState = { error: "" };
const BUCKET = "post-media";

export function PostForm({ ownerId, pets }: { ownerId: string; pets: { id: string; name: string }[] }) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [state, formAction, pending] = useActionState(async (_prev: typeof initialState, formData: FormData) => {
    const result = await createPost(formData);
    return result ?? initialState;
  }, initialState);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const path = `${ownerId}/${crypto.randomUUID()}-${file.name}`;
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
      {pets.length > 0 && (
        <select name="petId" className="rounded border px-3 py-2">
          <option value="">Post as yourself</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              Post as {pet.name}
            </option>
          ))}
        </select>
      )}

      <textarea
        name="caption"
        placeholder="What's happening?"
        rows={3}
        className="rounded border px-3 py-2"
      />

      <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      {mediaUrl && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="Preview" className="w-full rounded object-cover" />
      )}
      <input type="hidden" name="mediaUrl" value={mediaUrl} />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || uploading}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
