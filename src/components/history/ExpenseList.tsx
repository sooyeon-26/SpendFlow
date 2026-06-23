import type { Expense } from "../../types/expense";
import { ExpenseCard } from "./ExpenseCard";

type ExpenseListProps = {
  expenses: Expense[];
  onDelete: (id: string) => void;
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="expense-list">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} onDelete={onDelete} />
      ))}
      {expenses.length === 0 ? <p className="empty-state">아직 이 카테고리의 소비 흐름이 없어요.</p> : null}
    </div>
  );
}
