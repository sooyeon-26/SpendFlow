import { useEffect } from "react";
import { HistoryScreen } from "../components/history/HistoryScreen";
import { HomeScreen } from "../components/home/HomeScreen";
import { InputScreen } from "../components/input/InputScreen";
import { MobileShell } from "../components/layout/MobileShell";
import { DeviceFrame } from "../components/layout/DeviceFrame";
import { OnboardingScreen } from "../components/OnboardingScreen";
import { ReportScreen } from "../components/report/ReportScreen";
import { useOnboarding } from "../hooks/useOnboarding";
import { useExpenseStore } from "../store/expenseStore";
import { isDemoResetMessage } from "../utils/demoControls";

export function App() {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const loadExpenses = useExpenseStore((state) => state.loadExpenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const isDemo = useExpenseStore((state) => state.isDemo);
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    if (window.parent === window || new URLSearchParams(window.location.search).get("view") !== "embed") return;
    const resetFromPortfolio = (event: MessageEvent) => {
      if (isDemoResetMessage(event, window.parent, import.meta.env.DEV)) {
        // The store also guards personal records against demo reset requests.
        useExpenseStore.getState().resetDemo();
      }
    };
    window.addEventListener("message", resetFromPortfolio);
    return () => window.removeEventListener("message", resetFromPortfolio);
  }, []);

  const screen = {
    home: <HomeScreen />,
    input: <InputScreen />,
    history: <HistoryScreen />,
    report: <ReportScreen />
  }[activeTab];

  if (shouldShowOnboarding && !isDemo) {
    return <DeviceFrame><OnboardingScreen onComplete={completeOnboarding} /></DeviceFrame>;
  }

  return (
    <MobileShell>
      {isLoading ? <div className="loading-state">소비 흐름을 불러오는 중...</div> : screen}
    </MobileShell>
  );
}
