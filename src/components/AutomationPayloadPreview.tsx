import type { AutomationPayload } from "../utils/createAutomationPayload";
import { GlassCard } from "./ui/GlassCard";

export function AutomationPayloadPreview({ payload }: { payload: AutomationPayload }) {
  return (
    <GlassCard className="preview-card">
      <div className="card-heading">
        <h2>Automation payload preview</h2>
        <span>dev</span>
      </div>
      <pre style={{ maxHeight: 180, overflow: "auto", margin: 0, fontSize: 11, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </GlassCard>
  );
}
