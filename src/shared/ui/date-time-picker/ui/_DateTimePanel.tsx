
import { type MouseEventHandler, type RefObject, useEffect, useMemo, useRef } from 'react';

import { getMinuteOptions, isValidDate, padTimeUnit } from '../lib/dateTime';

type DateTimePanelProps = {
  minuteStep: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  selectedDate: Date | null;
  minDate?: Date;
  maxDate?: Date;
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
  const targetScrollTop = selectedItem.offsetTop - column.clientHeight / 2 + selectedItem.clientHeight / 2;

  column.scrollTop = Math.min(Math.max(targetScrollTop, 0), maxScrollTop);
};

const handleOptionMouseDown: MouseEventHandler<HTMLButtonElement> = event => {
  event.stopPropagation();
};

const isSameCalendarDate = (date: Date | null, compareDate?: Date) => {
  if (!isValidDate(date) || !isValidDate(compareDate)) return false;

  return date.toDateString() === compareDate.toDateString();
};

export const DateTimePanel = ({
  minuteStep,
  onHourChange,
  onMinuteChange,
  selectedDate,
  minDate,
  maxDate,
}: DateTimePanelProps) => {
  const hourColumnRef = useRef<HTMLDivElement>(null);
  const minuteColumnRef = useRef<HTMLDivElement>(null);
  const selectedHourRef = useRef<HTMLButtonElement>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement>(null);
  const selectedHour = selectedDate?.getHours() ?? 0;
  const selectedMinute = selectedDate?.getMinutes() ?? 0;
  const isMinDateSelected = isSameCalendarDate(selectedDate, minDate);
  const isMaxDateSelected = isSameCalendarDate(selectedDate, maxDate);

  const minutes = useMemo(() => {
    const minuteOptions = getMinuteOptions(minuteStep);

    return minuteOptions;
  }, [minuteStep]);

  const isHourDisabled = (hour: number) => {
    if (isMinDateSelected && minDate && hour < minDate.getHours()) {
      return true;
    }

    if (isMaxDateSelected && maxDate && hour > maxDate.getHours()) {
      return true;
    }
    return false;
  };

  const isMinuteDisabled = (minute: number) => {
    if (!selectedDate) return false;

    if (isMinDateSelected && minDate) {
      if (selectedHour < minDate.getHours()) {
        return true;
      }

      if (selectedHour === minDate.getHours() && minute < minDate.getMinutes()) {
        return true;
      }
    }

    if (isMaxDateSelected && maxDate) {
      if (selectedHour > maxDate.getHours()) {
        return true;
      }

      if (selectedHour === maxDate.getHours() && minute > maxDate.getMinutes()) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    scrollSelectedItemIntoColumn(hourColumnRef, selectedHourRef);
    scrollSelectedItemIntoColumn(minuteColumnRef, selectedMinuteRef);
  }, [selectedHour, selectedMinute, selectedHour, selectedMinute]);

  return (
    <div className="dateTimePanel" aria-label="시간 선택">
      <div className="dateTimeColumn" role="listbox" aria-label="시" ref={hourColumnRef}>
        {HOURS.map(hour => {
          const selected = hour === selectedHour;
          const disabled = isHourDisabled(hour);

          return (
            <button
              aria-disabled={disabled}
              aria-selected={selected}
              className="dateTimeOption"
              disabled={disabled}
              key={hour}
              onClick={event => {
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

      <div className="dateTimeColumn" role="listbox" aria-label="분" ref={minuteColumnRef}>
        {minutes.map(minute => {
          const selected = minute === selectedMinute;
          const disabled = isMinuteDisabled(minute);

          return (
            <button
              aria-disabled={disabled}
              aria-selected={selected}
              className="dateTimeOption"
              disabled={disabled}
              key={minute}
              onClick={event => {
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
