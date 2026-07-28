"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MEDIA_BUCKET, validateImageFile } from "@/lib/media";
import { Avatar } from "@/components/ui/avatar";

export function AvatarUpload({
  ownerId,
  fieldName,
  initialUrl,
  fallbackName,
}: {
  ownerId: string;
  fieldName: string;
  initialUrl?: string | null;
  fallbackName: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const path = `avatars/${ownerId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={fallbackName} src={url || null} size="lg" />
      {/* min-w-0 + a constrained file input: the native control has a wide
          intrinsic size that otherwise pushes the whole form past the viewport. */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full max-w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-muted-bg file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
        />
        {uploading && <p className="text-sm text-muted">Uploading...</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <input type="hidden" name={fieldName} value={url} />
    </div>
  );
}
