type Variant = "default" | "success" | "danger" | "muted";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success-bg text-success",
  danger: "bg-danger-bg text-danger",
  muted: "bg-muted-bg text-muted",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
