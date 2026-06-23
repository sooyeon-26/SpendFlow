import { BellDot, ChevronRight, MessageSquareText } from "lucide-react";
import { useState } from "react";

type OnboardingScreenProps = {
  onComplete: () => void;
};

const slides = [
  {
    title: "소비를 수위로 확인해요",
    description: "이번 달 예산을 얼마나 사용했는지\n물의 높이로 직관적으로 보여줘요.",
    visual: "level"
  },
  {
    title: "위험한 소비 흐름을 감지해요",
    description: "예산 80% 도달, 특정 카테고리 집중 소비처럼\n주의가 필요한 순간을 자동으로 찾아줘요.",
    visual: "alert"
  },
  {
    title: "매일 소비 브리핑을 받아요",
    description: "하루 소비 요약과 위험 신호를\n정해진 시간에 알림으로 확인할 수 있어요.",
    visual: "briefing"
  }
] as const;

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setActiveIndex((index) => Math.min(index + 1, slides.length - 1));
  };

  const handleTouchEnd = (clientX: number) => {
    if (touchStartX === null) return;
    const delta = clientX - touchStartX;
    if (Math.abs(delta) > 48) {
      setActiveIndex((index) => {
        if (delta < 0) return Math.min(index + 1, slides.length - 1);
        return Math.max(index - 1, 0);
      });
    }
    setTouchStartX(null);
  };

  return (
    <main
      className="onboarding-screen"
      aria-label="SpendFlow 첫 실행 온보딩"
      onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="onboarding-ambient onboarding-ambient-one" />
      <div className="onboarding-ambient onboarding-ambient-two" />
      <section className="onboarding-panel" aria-live="polite">
        <div className="onboarding-visual" aria-hidden="true">
          {activeSlide.visual === "level" ? (
            <div className="onboarding-level-mark">
              <img src="/pwa-icon.svg" alt="" />
            </div>
          ) : null}
          {activeSlide.visual === "alert" ? (
            <div className="onboarding-alert-mark">
              <BellDot size={42} strokeWidth={1.8} />
              <span />
            </div>
          ) : null}
          {activeSlide.visual === "briefing" ? (
            <div className="onboarding-briefing-mark">
              <MessageSquareText size={38} strokeWidth={1.8} />
              <i />
              <b />
            </div>
          ) : null}
        </div>
        <div className="onboarding-copy">
          <p>{activeIndex + 1} / {slides.length}</p>
          <h1>{activeSlide.title}</h1>
          <span>{activeSlide.description}</span>
        </div>
      </section>
      <div className="onboarding-footer">
        <div className="onboarding-dots" aria-label={`총 ${slides.length}장 중 ${activeIndex + 1}번째`}>
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={index === activeIndex ? "onboarding-dot onboarding-dot-active" : "onboarding-dot"}
              aria-label={`${index + 1}번째 온보딩 보기`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <button type="button" className="onboarding-primary-button" onClick={goNext}>
          <span>{isLastSlide ? "SpendFlow 시작하기" : "다음"}</span>
          <ChevronRight size={18} strokeWidth={2.3} />
        </button>
      </div>
    </main>
  );
}
