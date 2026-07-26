import { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-4">
      {children}
    </div>
  );
}
