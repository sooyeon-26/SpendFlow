import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useExpenseStore } from "../../store/expenseStore";

export function Toast() {
  const toast = useExpenseStore((state) => state.toast);
  const hideToast = useExpenseStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast.visible) return;
    const timeout = window.setTimeout(hideToast, 2200);
    return () => window.clearTimeout(timeout);
  }, [hideToast, toast.visible]);

  return (
    <div className={`toast ${toast.visible ? "toast-show" : ""}`} role="status">
      <CheckCircle2 size={18} />
      <span>{toast.message}</span>
    </div>
  );
}
