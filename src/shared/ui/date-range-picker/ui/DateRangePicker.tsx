import "react-datepicker/dist/react-datepicker.css";
import "../assets/date-range-picker.css";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactDatePicker from "react-datepicker";

import {
  isAllQuickRange,
  QUICK_RANGES,
  type QuickRange,
} from "../config/quickRanges";
import {
  type DisabledRange,
  formatDate,
  getDisabledInterval,
  getQuickRangeBaseDate,
  getQuickRangeDates,
  getQuickRanges,
  parseDate,
  type RangeDirection,
} from "../lib/date";
import { DateRangeInput } from "./_DateRangeInput";
import { DateRangeQuickActions } from "./_DateRangeQuickActions";

export type Props = {
  /** 선택된 시작일. yyyy-MM-dd 문자열을 사용한다. */
  startDate: string;
  /** 선택된 종료일. yyyy-MM-dd 문자열을 사용한다. */
  endDate: string;
  /** 빠른 기간 버튼의 계산 방향. past: 기준일 이전, future: 기준일 이후 */
  quickRangeDirection?: RangeDirection;
  /** 빠른 기간 버튼 목록. 전체 같은 사용자 정의 액션도 전달할 수 있다. */
  quickRanges?: QuickRange[];
  /** 필터형 입력에서 라벨 영역에 표시할 텍스트 */
  filterLabel?: string;
  /** 입력 표시 방식. range는 기존 두 칸 입력, filter는 필터바용 단일 입력이다. */
  inputVariant?: "filter" | "range";
  /** 선택할 수 없는 날짜 구간. react-datepicker의 excludeDateIntervals로 변환된다. */
  disabledRanges?: DisabledRange[];
  /** 시작일과 종료일이 모두 선택된 경우에만 외부 값에 반영한다. */ // 수정됨
  requireCompleteRange?: boolean; // 수정됨
  /** 날짜가 변경될 때 yyyy-MM-dd 문자열로 반환한다. */
  onChange: (startDate: string, endDate: string) => void;
};

type QuickRangeSelection = {
  endDate: string;
  label: string;
  startDate: string;
};

const getDateRangeDisplayValue = (startDate: string, endDate: string) => {
  if (startDate && endDate) {
    return `${startDate} ~ ${endDate}`;
  }

  if (startDate) {
    return `${startDate} ~`;
  }

  return "";
};

const getQuickRangeDisplayValue = (
  quickRangeSelection: null | QuickRangeSelection,
  startDate: string,
  endDate: string,
) => {
  if (
    !quickRangeSelection ||
    quickRangeSelection.startDate !== startDate ||
    quickRangeSelection.endDate !== endDate
  ) {
    return null;
  }

  return quickRangeSelection.label;
};

/**
 * 두 개월 달력을 보여주는 기간 선택 컴포넌트.
 * 직접 날짜 선택과 빠른 기간 선택을 모두 지원한다.
 */
export const DateRangePicker = ({
  startDate,
  endDate,
  quickRangeDirection = "past",
  quickRanges: quickRangeOptions = QUICK_RANGES,
  filterLabel,
  inputVariant = "range",
  disabledRanges = [],
  requireCompleteRange = false, // 수정됨
  onChange,
}: Props) => {
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [quickRangeSelection, setQuickRangeSelection] =
    useState<null | QuickRangeSelection>(null);
  const [draftRange, setDraftRange] = useState({ startDate, endDate }); // 수정됨

  useEffect(() => {
    setDraftRange({ startDate, endDate });
  }, [endDate, startDate]);

  const pickerStartDate = requireCompleteRange
    ? draftRange.startDate
    : startDate; // 수정됨
  const pickerEndDate = requireCompleteRange ? draftRange.endDate : endDate; // 수정됨
  const displayStartDate = requireCompleteRange ? startDate : pickerStartDate; // 수정됨
  const displayEndDate = requireCompleteRange ? endDate : pickerEndDate; // 수정됨
  const selectedStartDate = parseDate(pickerStartDate);
  const selectedEndDate = parseDate(pickerEndDate);
  const quickRangeDisplayValue = getQuickRangeDisplayValue(
    quickRangeSelection,
    displayStartDate,
    displayEndDate,
  );
  const dateRangeDisplayValue = getDateRangeDisplayValue(
    displayStartDate,
    displayEndDate,
  );
  const inputDisplayValue = quickRangeDisplayValue || dateRangeDisplayValue;
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
    quickRangeOptions,
    quickRangeDirection,
    quickRangeBaseDate,
    disabledIntervals,
  );

  /** 빠른 기간 버튼 클릭 시 기준일과 방향에 맞춰 시작일/종료일을 계산한다. */
  const handleQuickRange = (quickRange: QuickRange) => {
    if (isAllQuickRange(quickRange)) {
      if (requireCompleteRange) {
        setDraftRange({ endDate: "", startDate: "" }); // 수정됨
      }
      setQuickRangeSelection({
        endDate: "",
        label: quickRange.label,
        startDate: "",
      });
      onChange("", "");
      pickerRef.current?.setOpen(false);
      return;
    }

    const { nextEndDate, nextStartDate } = getQuickRangeDates(
      quickRange,
      quickRangeDirection,
      quickRangeBaseDate,
    );
    const nextStartDateValue = formatDate(nextStartDate);
    const nextEndDateValue = formatDate(nextEndDate);

    setQuickRangeSelection({
      endDate: nextEndDateValue,
      label: quickRange.label,
      startDate: nextStartDateValue,
    });
    if (requireCompleteRange) {
      setDraftRange({
        endDate: nextEndDateValue,
        startDate: nextStartDateValue,
      });
    }
    onChange(nextStartDateValue, nextEndDateValue);
    pickerRef.current?.setOpen(false);
  };

  return (
    <div className="dateRangePicker">
      <ReactDatePicker
        calendarClassName="dateRangeCalendar"
        customInput={
          <DateRangeInput
            displayValue={inputDisplayValue}
            endValue={displayEndDate} // 수정됨
            filterLabel={filterLabel}
            inputVariant={inputVariant}
            isOpen={isOpen}
            onClear={() => {
              if (requireCompleteRange) {
                setDraftRange({ endDate: "", startDate: "" });
              }
              setQuickRangeSelection(null);
              onChange("", "");
            }}
            startValue={displayStartDate} // 수정됨
          />
        }
        dateFormat="yyyy-MM-dd"
        dateFormatCalendar="yyyy MMM"
        endDate={selectedEndDate}
        excludeDateIntervals={disabledIntervals}
        monthsShown={2}
        onCalendarClose={() => {
          setIsOpen(false);
          if (
            requireCompleteRange &&
            Boolean(draftRange.startDate) !== Boolean(draftRange.endDate)
          ) {
            setDraftRange({ endDate, startDate });
          }
        }} // 수정됨
        onCalendarOpen={() => setIsOpen(true)}
        onChange={([nextStartDate, nextEndDate]) => {
          const nextStartDateValue = formatDate(nextStartDate);
          const nextEndDateValue = formatDate(nextEndDate);

          if (requireCompleteRange) {
            setDraftRange({
              endDate: nextEndDateValue,
              startDate: nextStartDateValue,
            });
          }
          setQuickRangeSelection(null);

          if (
            requireCompleteRange &&
            (nextStartDateValue || nextEndDateValue) &&
            (!nextStartDateValue || !nextEndDateValue)
          ) {
            return; // 수정됨
          }

          onChange(nextStartDateValue, nextEndDateValue);
        }}
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

export type { QuickRange } from "../config/quickRanges";
export type { DisabledRange, RangeDirection } from "../lib/date";
