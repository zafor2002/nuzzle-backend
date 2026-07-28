import { z } from "zod";

export const MEDIA_BUCKET = "post-media";

/** 5 MB — matches what the Storage bucket should cap uploads at. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * The only prefix a stored media URL may have: the public path of our own
 * Storage bucket. Without this check a client can post any URL it likes —
 * the browser never has to use the uploader — and the app would happily
 * store it and render it from our pages.
 */
function publicBucketPrefix() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/`;
}

export function isOwnMediaUrl(url: string) {
  const prefix = publicBucketPrefix();
  // An unset env var would make the prefix a bare path and match far too much.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  return url.startsWith(prefix);
}

/** Optional media URL that must live in our own bucket. */
export const mediaUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine(isOwnMediaUrl, { message: "Images must be uploaded through the app." })
  .optional();

/** Client-side guard so bad files are rejected before they reach Storage. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please choose a JPEG, PNG, WebP or GIF image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`;
  }
  return null;
}
