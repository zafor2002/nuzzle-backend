import { describe, expect, it } from "vitest";
import { isHidden } from "@/lib/visibility";
import {
  isOwnMediaUrl,
  validateImageFile,
  validateVideoFile,
  MAX_UPLOAD_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/media";

describe("isHidden — anonymity resolves at owner OR pet level", () => {
  const publicOwner = { isAnonymous: false };
  const anonOwner = { isAnonymous: true };

  it("shows a public pet of a public owner", () => {
    expect(isHidden({ isAnonymous: false }, publicOwner)).toBe(false);
  });

  it("hides when only the pet is anonymous", () => {
    expect(isHidden({ isAnonymous: true }, publicOwner)).toBe(true);
  });

  it("hides when only the owner is anonymous", () => {
    expect(isHidden({ isAnonymous: false }, anonOwner)).toBe(true);
  });

  it("hides an owner-authored post when the owner is anonymous", () => {
    expect(isHidden(null, anonOwner)).toBe(true);
    expect(isHidden(undefined, anonOwner)).toBe(true);
  });

  it("shows an owner-authored post when the owner is public", () => {
    expect(isHidden(null, publicOwner)).toBe(false);
  });
});

describe("isOwnMediaUrl", () => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  it("accepts a URL in our own public bucket", () => {
    expect(isOwnMediaUrl(`${base}/storage/v1/object/public/post-media/abc/photo.png`)).toBe(true);
  });

  it("rejects an external host", () => {
    expect(isOwnMediaUrl("https://evil.example.com/tracker.gif")).toBe(false);
  });

  it("rejects a different bucket on the same host", () => {
    expect(isOwnMediaUrl(`${base}/storage/v1/object/public/other-bucket/x.png`)).toBe(false);
  });

  it("rejects a host that merely starts with ours", () => {
    expect(isOwnMediaUrl(`${base}.evil.com/storage/v1/object/public/post-media/x.png`)).toBe(false);
  });
});

describe("validateImageFile", () => {
  const file = (type: string, size: number) => ({ type, size }) as File;

  it("accepts a normal PNG", () => {
    expect(validateImageFile(file("image/png", 1024))).toBeNull();
  });

  it("rejects a non-image", () => {
    expect(validateImageFile(file("text/plain", 10))).toMatch(/JPEG|PNG/);
  });

  it("rejects an oversized image", () => {
    expect(validateImageFile(file("image/png", MAX_UPLOAD_BYTES + 1))).toMatch(/5MB/);
  });

  it("accepts a file exactly at the limit", () => {
    expect(validateImageFile(file("image/jpeg", MAX_UPLOAD_BYTES))).toBeNull();
  });
});

describe("validateVideoFile", () => {
  const file = (type: string, size: number) => ({ type, size }) as File;

  it("accepts an MP4 within the limit", () => {
    expect(validateVideoFile(file("video/mp4", 1024 * 1024))).toBeNull();
  });

  it("rejects a format browsers may not play", () => {
    expect(validateVideoFile(file("video/x-msvideo", 1024))).toMatch(/MP4, WebM or MOV/);
  });

  it("rejects an image sent to the video path", () => {
    expect(validateVideoFile(file("image/png", 1024))).toMatch(/MP4, WebM or MOV/);
  });

  it("rejects an oversized video", () => {
    expect(validateVideoFile(file("video/mp4", MAX_VIDEO_BYTES + 1))).toMatch(/50MB/);
  });
});
