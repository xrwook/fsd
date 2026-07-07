import type { QuickRange } from "../config/quickRanges";

type DateRangeQuickActionsProps = {
  onSelect: (quickRange: QuickRange) => void;
  quickRanges: QuickRange[];
};

export const DateRangeQuickActions = ({
  onSelect,
  quickRanges,
}: DateRangeQuickActionsProps) => (
  <div className="dateRangeQuickActions">
    {quickRanges.map((quickRange) => (
      <button
        className="dateRangeQuickButton"
        key={quickRange.label}
        onClick={() => onSelect(quickRange)}
        type="button"
      >
        {quickRange.label}
      </button>
    ))}
  </div>
);
