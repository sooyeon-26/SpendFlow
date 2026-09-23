import { useLayoutEffect, useRef, type PropsWithChildren } from "react";

export function DeviceFrame({ children }: PropsWithChildren) {
  const frameRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      frame.style.setProperty("--device-scale", String(entry.contentRect.width / 393));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-shell">
      <div className="device-frame" ref={frameRef}>
        <div className="device-screen">{children}</div>
      </div>
    </div>
  );
}
