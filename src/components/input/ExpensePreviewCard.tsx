import { Check, RotateCcw } from "lucide-react";
import type { ParsedExpenseResult } from "../../types/expense";
import { formatPercent, formatWon } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";

type ExpensePreviewCardProps = {
  preview: ParsedExpenseResult;
  onSave: () => void;
  onReset: () => void;
};

export function ExpensePreviewCard({ preview, onSave, onReset }: ExpensePreviewCardProps) {
  return (
    <GlassCard className="preview-card">
      <div className="card-heading">
        <h2>자동 분류 결과</h2>
        <Badge tone={preview.needsReview ? "warning" : "aqua"}>{preview.needsReview ? "확인 필요" : "확인 필요 없음"}</Badge>
      </div>
      <div className="preview-hero">
        <span>{preview.merchant}</span>
        <strong>{formatWon(preview.amount)}</strong>
      </div>
      <div className="preview-list">
        <div><span>카테고리</span><strong>{preview.category}</strong></div>
        <div><span>신뢰도</span><strong>{formatPercent(preview.confidence * 100)}</strong></div>
        <div><span>상태</span><strong>{preview.needsReview ? "확인 필요" : "확인 필요 없음"}</strong></div>
      </div>
      <div className="button-row">
        <Button onClick={onSave}><Check size={18} />저장하기</Button>
        <Button variant="secondary" onClick={onReset}><RotateCcw size={17} />다시 입력</Button>
      </div>
    </GlassCard>
  );
}
