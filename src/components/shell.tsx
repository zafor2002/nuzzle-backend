import { ReactNode } from "react";

export function Shell({
  left,
  right,
  children,
}: {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-start gap-4 px-4 py-4">
      {left && <aside className="hidden w-56 shrink-0 lg:block">{left}</aside>}
      <main className="min-w-0 flex-1">{children}</main>
      {right && <aside className="hidden w-72 shrink-0 xl:block">{right}</aside>}
    </div>
  );
}
