import { useExpenseStore } from "../../store/expenseStore";

const titles = {
  home: { title: "SpendFlow", subtitle: "오늘의 소비 흐름을 확인해볼까요?" },
  input: { title: "소비 빠른 기록", subtitle: "금액과 카테고리만 선택하면 바로 저장돼요" },
  history: { title: "소비 내역", subtitle: "흘러간 소비를 카드로 살펴봐요" },
  report: { title: "소비 리포트", subtitle: "최근 7일 흐름과 이번 달 예산을 확인해요" }
};

export function AppHeader() {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const copy = titles[activeTab];

  if (activeTab === "home") return null;

  return (
    <header className="app-header">
      <div>
        <p>{copy.subtitle}</p>
        <h1>{copy.title}</h1>
      </div>
    </header>
  );
}
