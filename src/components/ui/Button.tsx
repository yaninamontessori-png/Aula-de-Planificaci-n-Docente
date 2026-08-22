import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-55 disabled:cursor-wait focus-visible:outline-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-2",
  secondary:
    "bg-surface-2 text-brand hover:bg-[color-mix(in_srgb,var(--color-surface-2)_80%,var(--color-brand-2))]",
  ghost: "bg-transparent text-brand hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/** Devuelve las clases del botón; útil para links que deben verse como botón. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}
