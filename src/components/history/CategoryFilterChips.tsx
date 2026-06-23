import { useExpenseStore } from "../../store/expenseStore";
import type { ExpenseCategory } from "../../types/expense";

const categories = ["전체", "식비", "카페", "교통", "쇼핑", "구독", "생활", "기타"] as const;

export function CategoryFilterChips() {
  const selected = useExpenseStore((state) => state.selectedCategory);
  const setSelected = useExpenseStore((state) => state.setSelectedCategory);
  const expenses = useExpenseStore((state) => state.expenses);

  const countFor = (category: (typeof categories)[number]) => {
    if (category === "전체") return expenses.length;
    return expenses.filter((expense) => expense.category === (category as ExpenseCategory)).length;
  };

  return (
    <div className="chip-row sticky-chips chip-row-fade">
      {categories.map((category) => (
        <button key={category} className={`filter-chip ${selected === category ? "filter-chip-active" : ""}`} onClick={() => setSelected(category)}>
          <span>{category}</span>
          <i>{countFor(category)}</i>
        </button>
      ))}
    </div>
  );
}
