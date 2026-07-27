import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * The prototype's screen top bar: optional back chevron, title, optional action.
 * Sits under the sticky brand bar, so it is not itself sticky.
 */
export function PageHeader({
  title,
  back,
  action,
}: {
  title: string;
  back?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      {back && (
        <Link
          href={back}
          aria-label="Back"
          className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-foreground hover:bg-muted-bg"
        >
          <Icon name="back" className="h-5 w-5" />
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate text-[22px] font-bold">{title}</h1>
      {action}
    </div>
  );
}
