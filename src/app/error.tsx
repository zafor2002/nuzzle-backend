"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl">🐾</p>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
