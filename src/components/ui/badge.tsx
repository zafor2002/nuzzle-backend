type Variant = "default" | "success" | "danger" | "muted" | "info" | "warn";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success-bg text-success",
  danger: "bg-danger-bg text-danger",
  muted: "bg-muted-bg text-muted",
  info: "bg-[#DCE8F7] text-[#3B587C]",
  warn: "bg-[#FDE8D4] text-[#96602C]",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
