import type { PropsWithChildren } from "react";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { Toast } from "../ui/Toast";

export function MobileShell({ children }: PropsWithChildren) {
  return (
    <div className="page-shell">
      <main className="phone-frame">
        <div className="water-ambient water-ambient-one" />
        <div className="water-ambient water-ambient-two" />
        <AppHeader />
        <div className="screen-content">{children}</div>
        <BottomTabBar />
        <Toast />
      </main>
    </div>
  );
}
