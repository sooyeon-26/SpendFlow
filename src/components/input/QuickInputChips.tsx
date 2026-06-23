const quickInputs = ["스타벅스 6800원", "올리브영 28900원", "지하철 1550원", "넷플릭스 17000원"];

export function QuickInputChips({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <div className="chip-row">
      {quickInputs.map((input) => (
        <button key={input} className="filter-chip" onClick={() => onSelect(input)}>
          {input}
        </button>
      ))}
    </div>
  );
}
