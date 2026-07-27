import Link from "next/link";

/**
 * Horizontally scrolling filter pills. Server-rendered: each chip is a link that
 * sets a query param, so filtering works without client state.
 */
export function FilterChips({
  options,
  active,
  hrefFor,
}: {
  options: { label: string; value: string }[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((o) => {
        const on = o.value === active;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            className={`shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
              on
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted hover:bg-muted-bg"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
