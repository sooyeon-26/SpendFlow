import { FileText, FolderCheck, Waves } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

const steps = [
  { label: "문장 입력", Icon: FileText },
  { label: "자동 분류", Icon: FolderCheck },
  { label: "흐름 저장", Icon: Waves }
];

export function AutomationFlowCard() {
  return (
    <GlassCard className="automation-card">
      <div>
        <strong>SpendFlow가 자동으로 읽어요</strong>
        <p>문장 입력 → 금액 추출 → 카테고리 분류 → 흐름에 저장</p>
      </div>
      <div className="automation-steps">
        {steps.map(({ label, Icon }) => (
          <span key={label}>
            <Icon size={15} />
            {label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
