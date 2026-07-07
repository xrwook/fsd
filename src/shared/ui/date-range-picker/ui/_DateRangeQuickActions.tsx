import type { QuickRange } from "../config/quickRanges";

type QuickRangeAction = QuickRange & {
  disabled?: boolean;
};

type DateRangeQuickActionsProps = {
  onSelect: (quickRange: QuickRange) => void;
  quickRanges: QuickRangeAction[];
};

/** 하단 빠른 기간 버튼 영역을 렌더링한다. */
export const DateRangeQuickActions = ({
  onSelect,
  quickRanges,
}: DateRangeQuickActionsProps) => (
  <div className="dateRangeQuickActions">
    {quickRanges.map((quickRange) => (
      <button
        className="dateRangeQuickButton"
        disabled={quickRange.disabled}
        key={quickRange.label}
        onClick={() => onSelect(quickRange)}
        type="button"
      >
        {quickRange.label}
      </button>
    ))}
  </div>
);
