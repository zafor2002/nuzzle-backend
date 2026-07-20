export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-sm flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="animate-pulse text-4xl">🐾</p>
      <p className="text-sm text-muted">Loading…</p>
    </main>
  );
}
