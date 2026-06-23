import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { isStandalonePWA } from "../../utils/pwa";
import { GlassCard } from "../ui/GlassCard";

export function PwaInstallCard() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    setShouldShow(!isStandalonePWA());
  }, []);

  if (!shouldShow) return null;

  return (
    <GlassCard className="pwa-install-card">
      <div className="card-heading">
        <h2>앱처럼 사용하기</h2>
        <Smartphone size={18} />
      </div>
      <p>
        iPhone Safari에서 공유 버튼을 누르고
        <br />
        ‘홈 화면에 추가’를 선택하면 SpendFlow를 앱처럼 사용할 수 있어요.
      </p>
    </GlassCard>
  );
}
