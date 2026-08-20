import {
  type MouseEventHandler,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { getMinuteOptions, isValidDate, padTimeUnit } from "../lib/dateTime";

type DateTimePanelProps = {
  /** 선택 가능한 최소 날짜 */ // 수정됨
  minDate?: Date; // 수정됨
  minuteStep: number;
  /** 선택 가능한 최대 날짜 */ // 수정됨
  maxDate?: Date; // 수정됨
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  selectedDate: Date | null;
};

const HOURS = Array.from({ length: 24 }, (_, index) => index);

const scrollSelectedItemIntoColumn = (
  columnRef: RefObject<HTMLDivElement | null>,
  selectedRef: RefObject<HTMLButtonElement | null>,
) => {
  const column = columnRef.current;
  const selectedItem = selectedRef.current;

  if (!column || !selectedItem) return;

  const maxScrollTop = column.scrollHeight - column.clientHeight;
  const targetScrollTop =
    selectedItem.offsetTop -
    column.clientHeight / 2 +
    selectedItem.clientHeight / 2;

  column.scrollTop = Math.min(Math.max(targetScrollTop, 0), maxScrollTop);
};

const handleOptionMouseDown: MouseEventHandler<HTMLButtonElement> = (event) => {
  event.stopPropagation();
};

// 수정됨: 선택된 날짜와 제한 날짜가 같은 날인지 비교한다.
const isSameCalendarDate = (date: Date | null, compareDate?: Date) => {
  if (!isValidDate(date) || !isValidDate(compareDate)) return false;

  return date.toDateString() === compareDate.toDateString();
};

export const DateTimePanel = ({
  minDate, // 수정됨
  minuteStep,
  maxDate, // 수정됨
  onHourChange,
  onMinuteChange,
  selectedDate,
}: DateTimePanelProps) => {
  const hourColumnRef = useRef<HTMLDivElement>(null);
  const minuteColumnRef = useRef<HTMLDivElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const selectedHour = selectedDate?.getHours() ?? 0;
  const selectedMinute = selectedDate?.getMinutes() ?? 0;
  const isMinDateSelected = isSameCalendarDate(selectedDate, minDate); // 수정됨
  const isMaxDateSelected = isSameCalendarDate(selectedDate, maxDate); // 수정됨
  const minutes = useMemo(() => {
    const minuteOptions = getMinuteOptions(minuteStep);

    if (minuteOptions.includes(selectedMinute)) {
      return minuteOptions;
    }

    const insertIndex = minuteOptions.findIndex(
      (minute) => selectedMinute < minute,
    );
    const safeInsertIndex =
      insertIndex === -1 ? minuteOptions.length : insertIndex;
    const previousMinute = minuteOptions[safeInsertIndex - 1] ?? -1;
    const nextMinute = minuteOptions[safeInsertIndex] ?? 60;
    const extraMinutes = Array.from(
      { length: nextMinute - previousMinute - 1 },
      (_, index) => previousMinute + index + 1,
    );

    return [
      ...minuteOptions.slice(0, safeInsertIndex),
      ...extraMinutes,
      ...minuteOptions.slice(safeInsertIndex),
    ];
  }, [minuteStep, selectedMinute]);

  // 수정됨: minDate/maxDate와 같은 날짜에서는 범위 밖 시각을 선택하지 못하게 한다.
  const isHourDisabled = (hour: number) => {
    if (isMinDateSelected && minDate && hour < minDate.getHours()) {
      return true;
    }

    if (isMaxDateSelected && maxDate && hour > maxDate.getHours()) {
      return true;
    }

    return false;
  };

  // 수정됨: 같은 시(hour) 안에서는 minDate/maxDate의 분 단위 제한까지 적용한다.
  const isMinuteDisabled = (minute: number) => {
    if (!selectedDate) return false;

    if (isMinDateSelected && minDate) {
      if (selectedHour < minDate.getHours()) return true;
      if (selectedHour === minDate.getHours() && minute < minDate.getMinutes())
        return true;
    }

    if (isMaxDateSelected && maxDate) {
      if (selectedHour > maxDate.getHours()) return true;
      if (selectedHour === maxDate.getHours() && minute > maxDate.getMinutes())
        return true;
    }

    return false;
  };

  useEffect(() => {
    scrollSelectedItemIntoColumn(hourColumnRef, selectedHourRef);
    scrollSelectedItemIntoColumn(minuteColumnRef, selectedMinuteRef);
  }, [selectedHour, selectedMinute]);

  return (
    <div className="dateTimePanel" aria-label="시간 선택">
      <div
        className="dateTimeColumn"
        role="listbox"
        aria-label="시"
        ref={hourColumnRef}
      >
        {HOURS.map((hour) => {
          const selected = hour === selectedHour;
          const disabled = isHourDisabled(hour); // 수정됨

          return (
            <button
              aria-disabled={disabled} // 수정됨
              aria-selected={selected}
              className="dateTimeOption"
              disabled={disabled} // 수정됨
              key={hour}
              onClick={(event) => {
                event.stopPropagation();
                onHourChange(hour);
              }}
              onMouseDown={handleOptionMouseDown}
              ref={selected ? selectedHourRef : undefined}
              role="option"
              type="button"
            >
              {padTimeUnit(hour)}
            </button>
          );
        })}
      </div>

      <div
        className="dateTimeColumn"
        role="listbox"
        aria-label="분"
        ref={minuteColumnRef}
      >
        {minutes.map((minute) => {
          const selected = minute === selectedMinute;
          const disabled = isMinuteDisabled(minute); // 수정됨

          return (
            <button
              aria-disabled={disabled} // 수정됨
              aria-selected={selected}
              className="dateTimeOption"
              disabled={disabled} // 수정됨
              key={minute}
              onClick={(event) => {
                event.stopPropagation();
                onMinuteChange(minute);
              }}
              onMouseDown={handleOptionMouseDown}
              ref={selected ? selectedMinuteRef : undefined}
              role="option"
              type="button"
            >
              {padTimeUnit(minute)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
