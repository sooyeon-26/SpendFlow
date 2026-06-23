import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Save, Wand2 } from "lucide-react";
import { DEFAULT_PAYMENT_METHOD, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../../constants/expenses";
import { classifyExpenseText } from "../../services/aiClassifier";
import { useExpenseStore } from "../../store/expenseStore";
import type { ExpenseCategory, ParsedExpenseResult, PaymentMethod } from "../../types/expense";
import { toDateKey } from "../../utils/date";
import { createExpenseId } from "../../utils/id";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { ExpensePreviewCard } from "./ExpensePreviewCard";
import { QuickInputChips } from "./QuickInputChips";
import { AutomationFlowCard } from "./AutomationFlowCard";

export function ExpenseInputCard() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ParsedExpenseResult | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("카페");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
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
      id: createExpenseId(),
      date: preview.date,
      merchant: preview.merchant,
      amount: preview.amount,
      category: preview.category,
      paymentMethod: preview.paymentMethod ?? DEFAULT_PAYMENT_METHOD,
      source: preview.source,
      confidence: preview.confidence,
      needsReview: preview.needsReview,
      memo: preview.memo || preview.rawText,
      createdAt: new Date().toISOString()
    });
    setPreview(null);
    setText("");
  };

  const saveManualExpense = async () => {
    const numericAmount = Number(amount.replace(/[^0-9]/g, ""));
    if (numericAmount <= 0 || !date) return;

    await addExpense({
      id: createExpenseId(),
      date,
      merchant: memo.trim() || "직접 입력",
      amount: numericAmount,
      category,
      paymentMethod,
      source: "manual",
      confidence: 1,
      needsReview: false,
      memo: memo.trim(),
      createdAt: new Date().toISOString()
    });

    setAmount("");
    setMemo("");
    setCategory("카페");
    setPaymentMethod(DEFAULT_PAYMENT_METHOD);
    setDate(toDateKey(new Date()));
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
        <div className="input-heading">
          <strong>소비 흐름 입력</strong>
          <span>입력하면 홈 수위와 리포트가 바로 갱신돼요</span>
        </div>
        <div className="manual-expense-form">
          <label htmlFor="expense-amount">금액</label>
          <input
            id="expense-amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="예: 6800"
            inputMode="numeric"
          />
          <label htmlFor="expense-category">카테고리</label>
          <select id="expense-category" value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label htmlFor="expense-memo">메모</label>
          <input
            id="expense-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="예: 스타벅스, 점심, 택시"
          />
          <div className="input-two-col">
            <div>
              <label htmlFor="expense-date">날짜</label>
              <input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <label htmlFor="expense-payment">결제수단</label>
              <select id="expense-payment" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <Button onClick={saveManualExpense} disabled={Number(amount.replace(/[^0-9]/g, "")) <= 0 || !date}>
          <Save size={18} />
          저장하기
        </Button>
        <div className="input-divider"><span>또는 문장으로 자동 분류</span></div>
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
