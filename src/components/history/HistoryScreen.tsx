import { useExpenseStore } from "../../store/expenseStore";
import { getTotalSpent } from "../../utils/analytics";
import { formatWon } from "../../utils/format";
import { GlassCard } from "../ui/GlassCard";
import { CategoryFilterChips } from "./CategoryFilterChips";
import { ExpenseList } from "./ExpenseList";

export function HistoryScreen() {
  const expenses = useExpenseStore((state) => state.expenses);
  const budget = useExpenseStore((state) => state.budget);
  const selectedCategory = useExpenseStore((state) => state.selectedCategory);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const total = getTotalSpent(expenses);
  const filtered = selectedCategory === "전체" ? expenses : expenses.filter((expense) => expense.category === selectedCategory);

  return (
    <div className="screen-stack">
      <GlassCard className="history-summary">
        <span>이번 달 총 소비</span>
        <strong>{formatWon(total)}</strong>
        <p>남은 예산 {formatWon(Math.max(0, budget.monthlyBudget - total))}</p>
      </GlassCard>
      <CategoryFilterChips />
      <ExpenseList expenses={filtered} onDelete={deleteExpense} />
    </div>
  );
}
