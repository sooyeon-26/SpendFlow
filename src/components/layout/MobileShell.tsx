import type { PropsWithChildren } from "react";
import { useExpenseStore } from "../../store/expenseStore";
import { AppHeader } from "./AppHeader";
import { BottomTabBar } from "./BottomTabBar";
import { Toast } from "../ui/Toast";

export function MobileShell({ children }: PropsWithChildren) {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const isHome = activeTab === "home";

  return (
    <div className={`page-shell ${isHome ? "page-shell-home" : ""}`}>
      <main className={`phone-frame ${isHome ? "phone-frame-home" : ""}`}>
        <div className="water-ambient water-ambient-one" />
        <div className="water-ambient water-ambient-two" />
        <AppHeader />
        <div className={`screen-content ${isHome ? "screen-content-home" : ""}`}>{children}</div>
        <BottomTabBar />
        <Toast />
      </main>
    </div>
  );
}
