import { headers } from "next/headers";

// In-memory rate limiter. Fine for a single dev/small-scale instance; if this
// app ever runs on multiple serverless instances, replace with a shared store
// (e.g. Upstash Redis) since each instance would otherwise track its own counts.
const hits = new Map<string, number[]>();

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
