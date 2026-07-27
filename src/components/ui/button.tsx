import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground shadow-[0_6px_14px_rgba(244,145,92,0.3)] hover:opacity-90",
  secondary: "border-[1.5px] border-border bg-card hover:bg-muted-bg",
  ghost: "text-muted hover:text-foreground",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 rounded-[14px] px-[18px] text-[14.5px]",
  sm: "h-[34px] rounded-[11px] px-3.5 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-[transform,opacity,background-color] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
