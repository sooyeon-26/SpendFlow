import { Coffee, CreditCard, CalendarDays } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { formatWon } from "../../utils/format";

type TodaySummaryCardProps = {
  today: number;
  weekly: number;
  topCategory: string;
};

export function TodaySummaryCard({ today, weekly, topCategory }: TodaySummaryCardProps) {
  const cards = [
    { label: "오늘 소비", value: formatWon(today), Icon: CreditCard },
    { label: "최근 7일", value: formatWon(weekly), Icon: CalendarDays },
    { label: "최다 카테고리", value: topCategory, Icon: Coffee }
  ];

  return (
    <div className="summary-grid">
      {cards.map(({ label, value, Icon }) => (
        <GlassCard className="summary-card" key={label}>
          <Icon size={18} />
          <span>{label}</span>
          <strong>{value}</strong>
        </GlassCard>
      ))}
    </div>
  );
}
