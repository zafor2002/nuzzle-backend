import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl">🐾</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted">
        Whatever you&apos;re looking for isn&apos;t here — it may have been moved or removed.
      </p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </main>
  );
}
