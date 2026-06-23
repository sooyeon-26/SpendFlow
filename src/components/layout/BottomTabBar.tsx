import { BarChart3, Home, ListChecks, PenLine } from "lucide-react";
import { useExpenseStore } from "../../store/expenseStore";
import type { TabId } from "../../types/expense";

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "홈", Icon: Home },
  { id: "input", label: "입력", Icon: PenLine },
  { id: "history", label: "내역", Icon: ListChecks },
  { id: "report", label: "리포트", Icon: BarChart3 }
];

export function BottomTabBar() {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const setActiveTab = useExpenseStore((state) => state.setActiveTab);

  return (
    <nav className="bottom-tabs" aria-label="주요 화면">
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} className={`tab-button ${activeTab === id ? "tab-active" : ""}`} onClick={() => setActiveTab(id)}>
          <span className="tab-icon">
            <Icon size={21} />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
