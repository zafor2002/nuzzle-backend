import { Icon, type IconName } from "@/components/ui/icon";

export function EmptyState({
  children,
  icon,
  title,
  action,
}: {
  children: React.ReactNode;
  icon?: IconName;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-11 text-center text-sm text-muted">
      {icon && (
        <span className="mx-auto mb-3.5 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-muted-bg text-[#B7A99E]">
          <Icon name={icon} className="h-7 w-7" />
        </span>
      )}
      {title && <p className="mb-1.5 text-[15px] font-bold text-foreground">{title}</p>}
      <p className="leading-relaxed">{children}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
