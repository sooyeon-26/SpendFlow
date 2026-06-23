import { useExpenseStore } from "../../store/expenseStore";

const titles = {
  home: { title: "SpendFlow", subtitle: "오늘의 소비 흐름을 확인해볼까요?" },
  input: { title: "소비 흐름 추가", subtitle: "문장 하나로 지출을 자동 분류해요" },
  history: { title: "소비 내역", subtitle: "흘러간 소비를 카드로 살펴봐요" },
  report: { title: "이번 주 소비 리포트", subtitle: "반복 파동과 위험 수위를 확인해요" }
};

export function AppHeader() {
  const activeTab = useExpenseStore((state) => state.activeTab);
  const copy = titles[activeTab];

  return (
    <header className="app-header">
      <div>
        <p>{copy.subtitle}</p>
        <h1>{copy.title}</h1>
      </div>
    </header>
  );
}
