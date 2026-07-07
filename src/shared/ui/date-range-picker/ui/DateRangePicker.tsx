import "react-datepicker/dist/react-datepicker.css";
import "../assets/date-range-picker.css";

import { useMemo, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";

import { QUICK_RANGES, type QuickRange } from "../config/quickRanges";
import {
  addDays,
  addMonths,
  formatDate,
  isDateRangeOverlapping,
  parseDate,
  startOfToday,
  toOrderedDateRange,
} from "../lib/date";
import { DateRangeInput } from "./_DateRangeInput";
import { DateRangeQuickActions } from "./_DateRangeQuickActions";

export type RangeDirection = "future" | "past";

export type DisabledRange = {
  endDate: string;
  startDate: string;
};

type DisabledInterval = {
  end: Date;
  start: Date;
};

export type Props = {
  /** 선택된 시작일. yyyy-MM-dd 문자열을 사용한다. */
  startDate: string;
  /** 선택된 종료일. yyyy-MM-dd 문자열을 사용한다. */
  endDate: string;
  /** 빠른 기간 버튼의 계산 방향. past: 기준일 이전, future: 기준일 이후 */
  quickRangeDirection?: RangeDirection;
  /** 선택할 수 없는 날짜 구간. react-datepicker의 excludeDateIntervals로 변환된다. */
  disabledRanges?: DisabledRange[];
  /** 날짜가 변경될 때 yyyy-MM-dd 문자열로 반환한다. */
  onChange: (startDate: string, endDate: string) => void;
};

/**
 * 두 개월 달력을 보여주는 기간 선택 컴포넌트.
 * 직접 날짜 선택과 빠른 기간 선택을 모두 지원한다.
 */
export const DateRangePicker = ({
  startDate,
  endDate,
  quickRangeDirection = "past",
  disabledRanges = [],
  onChange,
}: Props) => {
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedStartDate = parseDate(startDate);
  const selectedEndDate = parseDate(endDate);
  const disabledIntervals = useMemo(
    () => getDisabledInterval(disabledRanges),
    [disabledRanges],
  );
  const quickRangeBaseDate = getQuickRangeBaseDate(
    quickRangeDirection,
    selectedStartDate,
    selectedEndDate,
  );
  const quickRanges = getQuickRanges(
    QUICK_RANGES,
    quickRangeDirection,
    quickRangeBaseDate,
    disabledIntervals,
  );

  /** 빠른 기간 버튼 클릭 시 기준일과 방향에 맞춰 시작일/종료일을 계산한다. */
  const handleQuickRange = (quickRange: QuickRange) => {
    const { nextEndDate, nextStartDate } = getQuickRangeDates(
      quickRange,
      quickRangeDirection,
      quickRangeBaseDate,
    );

    onChange(formatDate(nextStartDate), formatDate(nextEndDate));
    pickerRef.current?.setOpen(false);
  };

  return (
    <div className="dateRangePicker">
      <ReactDatePicker
        calendarClassName="dateRangeCalendar"
        customInput={
          <DateRangeInput
            endValue={endDate}
            isOpen={isOpen}
            onClear={() => onChange("", "")}
            startValue={startDate}
          />
        }
        dateFormat="yyyy-MM-dd"
        dateFormatCalendar="yyyy MMM"
        endDate={selectedEndDate}
        excludeDateIntervals={disabledIntervals}
        monthsShown={2}
        onCalendarClose={() => setIsOpen(false)}
        onCalendarOpen={() => setIsOpen(true)}
        onChange={([nextStartDate, nextEndDate]) =>
          onChange(formatDate(nextStartDate), formatDate(nextEndDate))
        }
        popperClassName="dateRangePopper"
        popperPlacement="bottom-start"
        ref={pickerRef}
        selectsRange
        selected={selectedStartDate}
        showPopperArrow={false}
        startDate={selectedStartDate}
      >
        <DateRangeQuickActions
          onSelect={handleQuickRange}
          quickRanges={quickRanges}
        />
      </ReactDatePicker>
    </div>
  );
};

/**
 * 빠른 기간 계산의 기준일을 정한다.
 * past는 종료일 기준, future는 시작일 기준이 자연스럽고,
 * 선택된 날짜가 없으면 오늘을 기준으로 계산한다.
 */
const getQuickRangeBaseDate = (
  direction: RangeDirection,
  selectedStartDate: Date | null,
  selectedEndDate: Date | null,
): Date => {
  if (direction === "future") {
    return selectedStartDate ?? selectedEndDate ?? startOfToday();
  }

  return selectedEndDate ?? selectedStartDate ?? startOfToday();
};

/**
 * 빠른 기간 목록에 disabled 여부를 붙인다.
 * 계산된 빠른 기간이 선택 불가 구간과 겹치면 버튼을 비활성화한다.
 */
const getQuickRanges = (
  quickRanges: QuickRange[],
  direction: RangeDirection,
  baseDate: Date,
  disabledInterval: DisabledInterval[],
): Array<QuickRange & { disabled: boolean }> =>
  quickRanges.map((quickRange) => {
    const { nextEndDate, nextStartDate } = getQuickRangeDates(
      quickRange,
      direction,
      baseDate,
    );
    const quickDateRange = toOrderedDateRange(nextStartDate, nextEndDate);
    const disabled = disabledInterval.some((disabledDateInterval) =>
      isDateRangeOverlapping(quickDateRange, {
        endDate: disabledDateInterval.end,
        startDate: disabledDateInterval.start,
      }),
    );

    return {
      ...quickRange,
      disabled,
    };
  });

/**
 * 빠른 기간 하나를 실제 시작일/종료일로 변환한다.
 * 예: past + 3개월이면 기준일-3개월 ~ 기준일.
 */
const getQuickRangeDates = (
  quickRange: QuickRange,
  direction: RangeDirection,
  baseDate: Date,
): { nextEndDate: Date; nextStartDate: Date } => {
  const amount =
    direction === "future" ? quickRange.amount : -quickRange.amount;
  const targetDate =
    quickRange.unit === "days"
      ? addDays(baseDate, amount)
      : addMonths(baseDate, amount);

  return direction === "future"
    ? {
        nextEndDate: targetDate,
        nextStartDate: baseDate,
      }
    : {
        nextEndDate: baseDate,
        nextStartDate: targetDate,
      };
};

/** yyyy-MM-dd 문자열로 받은 선택 불가 구간을 react-datepicker가 쓰는 Date interval로 변환한다. */
const getDisabledInterval = (
  disabledDateRanges: DisabledRange[],
): DisabledInterval[] =>
  disabledDateRanges.flatMap((x) => {
    const startDate = parseDate(x.startDate);
    const endDate = parseDate(x.endDate);

    if (!startDate || !endDate) {
      return [];
    }

    const orderedDateRange = toOrderedDateRange(startDate, endDate);

    return {
      end: orderedDateRange.endDate,
      start: orderedDateRange.startDate,
    };
  });
