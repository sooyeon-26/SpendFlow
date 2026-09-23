import type { PropsWithChildren } from "react";

export function DeviceFrame({ children }: PropsWithChildren) {
  return (
    <div className="page-shell">
      <div className="device-frame">{children}</div>
    </div>
  );
}
