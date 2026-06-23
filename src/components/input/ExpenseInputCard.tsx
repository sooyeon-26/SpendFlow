import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Wand2 } from "lucide-react";
import { classifyExpenseText } from "../../services/aiClassifier";
import { useExpenseStore } from "../../store/expenseStore";
import type { ParsedExpenseResult } from "../../types/expense";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { ExpensePreviewCard } from "./ExpensePreviewCard";
import { QuickInputChips } from "./QuickInputChips";
import { AutomationFlowCard } from "./AutomationFlowCard";

export function ExpenseInputCard() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedExpenseResult | null>(null);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preview) return;
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [preview]);

  const parse = async (value = text) => {
    if (!value.trim()) return;
    const result = await classifyExpenseText(value);
    setPreview(result);
  };

  const save = async () => {
    if (!preview || preview.amount <= 0) return;
    await addExpense({
      id: crypto.randomUUID(),
      date: preview.date,
      merchant: preview.merchant,
      amount: preview.amount,
      category: preview.category,
      source: preview.source,
      confidence: preview.confidence,
      needsReview: preview.needsReview,
      createdAt: new Date().toISOString()
    });
    setPreview(null);
    setText("");
  };

  const selectQuick = (value: string) => {
    setText(value);
    inputRef.current?.focus();
  };

  return (
    <div className="screen-stack">
      <GlassCard className="input-card">
        <div className="input-icon">
          <Wand2 size={24} />
        </div>
        <label htmlFor="expense-input">소비 문장</label>
        <input
          id="expense-input"
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="예: 스타벅스 6800원"
          inputMode="text"
        />
        <Button onClick={() => parse()} disabled={!text.trim()}>
          <ArrowDownToLine size={18} />
          흐름에 추가하기
        </Button>
      </GlassCard>
      <AutomationFlowCard />
      <QuickInputChips onSelect={selectQuick} />
      {preview ? (
        <div ref={previewRef}>
          <ExpensePreviewCard preview={preview} onSave={save} onReset={() => setPreview(null)} />
        </div>
      ) : null}
    </div>
  );
}
