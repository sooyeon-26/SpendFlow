import { useLayoutEffect, useRef, useState, type PropsWithChildren } from "react";

export function DeviceFrame({ children }: PropsWithChildren) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [desktop, setDesktop] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  const view = new URLSearchParams(window.location.search).get("view");
  const framed = view === "device" || (view !== "embed" && view !== "app" && desktop);

  useLayoutEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setDesktop(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

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
    <div className={`page-shell${framed ? " page-shell-device" : ""}`}>
      <div className="device-frame" ref={frameRef}>
        <div className="device-screen">{children}</div>
      </div>
    </div>
  );
}
