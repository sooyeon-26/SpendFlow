import type { PropsWithChildren } from "react";

export function Badge({
  children,
  tone = "aqua",
  className = ""
}: PropsWithChildren<{ tone?: "aqua" | "warning" | "danger" | "neutral"; className?: string }>) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}
