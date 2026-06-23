import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}>;

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
