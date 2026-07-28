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

/**
 * Video limits for Reels.
 *
 * Supabase Storage stores files but does not transcode them, so whatever is
 * uploaded is what every viewer downloads. These caps keep that honest: web
 * formats only, and small enough to play on a phone connection. Raising them
 * meaningfully means putting a transcoding service (Mux, Cloudflare Stream) in
 * front of Storage rather than changing this number.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 90;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return "Please choose an MP4, WebM or MOV video.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `That video is ${(file.size / 1024 / 1024).toFixed(0)}MB — the limit is 50MB.`;
  }
  return null;
}

/** Reads duration from the file itself; the size cap alone does not bound length. */
export function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that video."));
    };
    video.src = url;
  });
}

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
