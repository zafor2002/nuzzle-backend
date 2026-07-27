import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col px-4 py-4">
      {children}
    </main>
  );
}
