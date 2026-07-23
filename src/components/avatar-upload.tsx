"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Avatar } from "@/components/ui/avatar";

const BUCKET = "post-media";

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

    setUploading(true);
    setError("");

    const supabase = createClient();
    const path = `avatars/${ownerId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={fallbackName} src={url || null} size="lg" />
      <div className="flex flex-col gap-1">
        <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        {uploading && <p className="text-sm text-muted">Uploading...</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <input type="hidden" name={fieldName} value={url} />
    </div>
  );
}
