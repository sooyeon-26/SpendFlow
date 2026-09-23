import type { PropsWithChildren } from "react";
import { useExpenseStore } from "../../store/expenseStore";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { Toast } from "../ui/Toast";
import { DeviceFrame } from "./DeviceFrame";
import { DemoBar } from "./DemoBar";

export function MobileShell({ children }: PropsWithChildren) {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const isHome = activeTab === "home";

  return (
    <DeviceFrame>
      <main className={`phone-frame ${isHome ? "phone-frame-home" : ""}`}>
        <div className="water-ambient water-ambient-one" />
        <div className="water-ambient water-ambient-two" />
        <DemoBar />
        <AppHeader />
        <div key={activeTab} className="screen-scroll" tabIndex={0} aria-label="화면 내용">
          <div className={`screen-content ${isHome ? "screen-content-home" : ""}`}>{children}</div>
        </div>
        <BottomTabBar />
        <Toast />
      </main>
    </DeviceFrame>
  );
}
