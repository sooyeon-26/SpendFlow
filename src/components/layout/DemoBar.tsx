import { useState } from "react";
import { useExpenseStore } from "../../store/expenseStore";

export function DemoBar() {
  const isDemo = useExpenseStore((state) => state.isDemo);
  const resetDemo = useExpenseStore((state) => state.resetDemo);
  const [confirmReset, setConfirmReset] = useState(false);
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  url.searchParams.delete("mode");
  url.searchParams.set(isDemo ? "mode" : "demo", isDemo ? "personal" : "1");

  return (
    <aside className="demo-bar" aria-label="데이터 모드">
      <span>{isDemo ? "시연 데이터" : "내 기록"}</span>
      {isDemo && (confirmReset ? (
        <>
          <button onClick={() => { resetDemo(); setConfirmReset(false); }}>시연 기록만 초기화</button>
          <button onClick={() => setConfirmReset(false)}>취소</button>
        </>
      ) : <button onClick={() => setConfirmReset(true)}>데모 초기화</button>)}
      {!confirmReset && <a href={url.pathname + url.search}>{isDemo ? "내 기록 보기" : "26% 데모 보기"}</a>}
    </aside>
  );
}
