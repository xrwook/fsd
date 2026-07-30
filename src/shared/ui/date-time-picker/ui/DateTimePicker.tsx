import "react-datepicker/dist/react-datepicker.css";
import "../assets/date-time-picker.css";

import { DateTime } from "luxon";
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDatePicker, { CalendarContainer } from "react-datepicker";

import {
  formatDateTime,
  normalizeDateTimeValue,
  setDateTimePart,
} from "../lib/dateTime";
import { DateTimeInput } from "./_DateTimeInput";
import { DateTimePanel } from "./_DateTimePanel";

export type DateTimePickerProps = {
  /** 선택된 날짜/시간 */
  value: Date | null;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 입력 영역 placeholder */
  placeholder?: string;
  /** 분 선택 간격 */
  minuteStep?: number;
  /** 선택 가능한 최소 날짜 */
  minDate?: Date;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date;
  /** 날짜/시간이 변경될 때 yyyy-MM-dd HH:mm 문자열로 반환한다. */
  onChange: (value: string) => void;
};

/**
 * 날짜 달력과 시/분 선택 컬럼을 함께 보여주는 단일 날짜/시간 선택 컴포넌트.
 */
export const DateTimePicker = ({
  value,
  disabled = false,
  placeholder,
  minuteStep = 5,
  minDate,
  maxDate,
  onChange,
}: DateTimePickerProps) => {
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = normalizeDateTimeValue(value);
  const displayValue = formatDateTime(selectedDate);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    pickerRef.current?.setOpen(false);
  }, []);

  useEffect(() => {
    if (disabled) {
      closePicker();
    }
  }, [closePicker, disabled]);

  const handleDateChange = useCallback(
    (nextDate: Date | null) => {
      if (disabled) return;

      if (!nextDate) {
        onChange("");
        return;
      }

      const selectedHour = selectedDate?.getHours() ?? 0;
      const selectedMinute = selectedDate?.getMinutes() ?? 0;
      const nextDateTime = DateTime.fromJSDate(nextDate)
        .set({
          hour: selectedHour,
          millisecond: 0,
          minute: selectedMinute,
          second: 0,
        })
        .toJSDate();

      onChange(formatDateTime(nextDateTime));
    },
    [disabled, onChange, selectedDate],
  );

  const handleHourChange = useCallback(
    (hour: number) => {
      if (disabled) return;

      onChange(formatDateTime(setDateTimePart(selectedDate, "hour", hour)));
    },
    [disabled, onChange, selectedDate],
  );

  const handleMinuteChange = useCallback(
    (minute: number) => {
      if (disabled) return;

      onChange(formatDateTime(setDateTimePart(selectedDate, "minute", minute)));
    },
    [disabled, onChange, selectedDate],
  );

  const calendarContainer = useMemo(
    () =>
      function DateTimeCalendarContainer({
        children,
        ...containerProps
      }: ComponentProps<typeof CalendarContainer>) {
        return (
          <CalendarContainer {...containerProps}>
            <div className="dateTimeCalendarLayout">
              <div className="dateTimeMonthPane">{children}</div>
              <DateTimePanel
                minuteStep={minuteStep}
                selectedDate={selectedDate}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            </div>
          </CalendarContainer>
        );
      },
    [handleHourChange, handleMinuteChange, minuteStep, selectedDate],
  );

  return (
    <div className="dateTimePicker">
      <ReactDatePicker
        calendarClassName="dateTimeCalendar"
        calendarContainer={calendarContainer}
        customInput={
          <DateTimeInput
            disabled={disabled}
            isOpen={isOpen}
            onClear={() => onChange("")}
            placeholder={placeholder}
            value={displayValue}
          />
        }
        dateFormat="yyyy-MM-dd HH:mm"
        dateFormatCalendar="yyyy MMM"
        disabled={disabled}
        maxDate={maxDate}
        minDate={minDate}
        onCalendarClose={() => setIsOpen(false)}
        onCalendarOpen={() => {
          if (disabled) {
            closePicker();
            return;
          }

          setIsOpen(true);
        }}
        onChange={handleDateChange}
        popperClassName="dateTimePopper"
        popperPlacement="bottom-start"
        ref={pickerRef}
        selected={selectedDate}
        shouldCloseOnSelect={false}
        showPopperArrow={false}
        open={disabled ? false : undefined}
      />
    </div>
  );
};
