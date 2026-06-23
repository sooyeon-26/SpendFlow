import { useState } from "react";

const ONBOARDING_STORAGE_KEY = "spendflow_onboarding_seen";

function readOnboardingSeen(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
}

export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(() => !readOnboardingSeen());

  const completeOnboarding = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }
    setShouldShowOnboarding(false);
  };

  return {
    shouldShowOnboarding,
    completeOnboarding
  };
}

// 개발 중 다시 보려면 브라우저 콘솔에서 실행하세요:
// localStorage.removeItem("spendflow_onboarding_seen");
