import { Clock } from "lucide-react";

export type SortMode = "recent";

interface SortToggleProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

const SortToggle = ({ value, onChange }: SortToggleProps) => {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 backdrop-blur-sm p-1 gap-0.5">
      <button
        onClick={() => onChange("recent")}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground shadow-sm"
        aria-label="Trier par date"
      >
        <Clock className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Récent</span>
      </button>
    </div>
  );
};

export default SortToggle;
