import {
  type MouseEventHandler,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { getMinuteOptions, padTimeUnit } from "../lib/dateTime";

type DateTimePanelProps = {
  minuteStep: number;
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

export const DateTimePanel = ({
  minuteStep,
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

          return (
            <button
              aria-selected={selected}
              className="dateTimeOption"
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

          return (
            <button
              aria-selected={selected}
              className="dateTimeOption"
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
