import { useRef, useState } from "react";
import { ChevronDown, PenLine, Save, Sparkles } from "lucide-react";
import { DEFAULT_PAYMENT_METHOD, EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../../constants/expenses";
import { classifyExpenseText } from "../../services/expenseClassifier";
import { useExpenseStore } from "../../store/expenseStore";
import type { ExpenseCategory, PaymentMethod } from "../../types/expense";
import { toDateKey } from "../../utils/date";
import { createExpenseId } from "../../utils/id";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";

const primaryPaymentMethods = PAYMENT_METHODS.filter((method) => ["카드", "현금", "계좌이체"].includes(method));

export function ExpenseInputCard() {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("카페");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  const [helperMessage, setHelperMessage] = useState("");
  const addExpense = useExpenseStore((state) => state.addExpense);
  const inputRef = useRef<HTMLInputElement>(null);

  const parse = async (value = text) => {
    if (!value.trim()) return;
    const result = await classifyExpenseText(value);
    if (result.amount > 0) setAmount(String(result.amount));
    setCategory(result.category);
    setPaymentMethod(primaryPaymentMethods.includes(result.paymentMethod) ? result.paymentMethod : DEFAULT_PAYMENT_METHOD);
    setDate(result.date);
    setMemo(result.merchant === "확인 필요" ? result.rawText : result.merchant);
    setHelperMessage("입력값을 빠른 저장 폼에 채웠어요.");
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
    setHelperMessage("");
    setText("");
  };

  return (
    <div className="screen-stack">
      <GlassCard className="input-card">
        <div className="input-icon">
          <PenLine size={24} />
        </div>
        <div className="input-heading">
          <strong>소비를 빠르게 기록해요</strong>
          <span>금액과 카테고리만 선택하면 이번 달 소비 수위에 바로 반영돼요.</span>
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
          <fieldset className="choice-field">
            <legend>카테고리</legend>
            <div className="category-pill-grid">
              {EXPENSE_CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`choice-pill ${category === item ? "choice-pill-active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="choice-field">
            <legend>결제수단</legend>
            <div className="payment-pill-row">
              {primaryPaymentMethods.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`choice-pill ${paymentMethod === item ? "choice-pill-active" : ""}`}
                  onClick={() => setPaymentMethod(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="expense-memo">메모</label>
          <input
            id="expense-memo"
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="선택 입력: 스타벅스, 점심, 택시"
          />
        </div>
        <details className="date-helper">
          <summary>
            <span>오늘 날짜로 저장</span>
            <ChevronDown size={17} />
          </summary>
          <label htmlFor="expense-date">날짜</label>
          <input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </details>
        <Button onClick={saveManualExpense} disabled={Number(amount.replace(/[^0-9]/g, "")) <= 0 || !date}>
          <Save size={18} />
          소비 저장하기
        </Button>
        <details className="sentence-helper">
          <summary>
            <span>
              <Sparkles size={16} />
              문장으로 입력해보기
            </span>
            <ChevronDown size={17} />
          </summary>
          <p>스타벅스 6800원 카드처럼 적으면 입력값을 자동으로 채워줘요.</p>
          <label htmlFor="expense-input">소비 문장</label>
          <input
            id="expense-input"
            ref={inputRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setHelperMessage("");
            }}
            placeholder="예: 스타벅스 6800원 카드"
            inputMode="text"
          />
          <Button variant="secondary" onClick={() => parse()} disabled={!text.trim()}>
            빠른 입력에 채우기
          </Button>
          {helperMessage ? <span className="helper-message">{helperMessage}</span> : null}
        </details>
      </GlassCard>
    </div>
  );
}
