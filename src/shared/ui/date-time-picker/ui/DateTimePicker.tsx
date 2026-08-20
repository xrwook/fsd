import "react-datepicker/dist/react-datepicker.css";
import "../assets/date-time-picker.css";

import { DateTime } from "luxon";
import {
  type ComponentProps,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDatePicker, { CalendarContainer } from "react-datepicker";

import {
  DATE_TIME_FORMAT,
  formatDateTime,
  formatTime,
  normalizeDateTimeValue,
  normalizeTimeValue,
  parseDateTime,
  parseTime,
  setDateTimePart,
} from "../lib/dateTime";
import { DateTimeInput } from "./_DateTimeInput";
import { DateTimePanel } from "./_DateTimePanel";

const DATE_TIME_INPUT_OUTSIDE_CLICK_IGNORE_CLASS =
  "dateTimeInputOutsideClickIgnore";

type DateTimePickerMode = "dateTime" | "time";

type DateTimePickerBaseProps = {
  /** 선택 가능한 최소 날짜 */
  minDate?: Date;
  /** 선택 가능한 최대 날짜 */
  maxDate?: Date;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 입력 영역 placeholder */
  placeholder?: string;
  /** 분 선택 간격 */
  minuteStep?: number;
  /** date format */ // 수정됨
  dateFormat?: string; // 수정됨
  /** 년, 월 용 달력 */ // 수정됨
  showMonthYearPicker?: boolean;
  /** yyyy-MM-dd HH:mm return. */
  onChange: (value: string) => void;
};

export type DateTimePickerProps =
  | (DateTimePickerBaseProps & {
      /** 날짜+시간 또는 시간 전용 선택 모드 */
      mode: "time";
      value: Date | string | null;
    })
  | (DateTimePickerBaseProps & {
      /** 날짜+시간 또는 시간 전용 선택 모드 */
      mode?: "dateTime";
      value: Date | null;
    });

const getPlaceholder = (
  mode: DateTimePickerMode,
  placeholder: string | undefined,
  dateFormat: string, // 수정됨
) => {
  if (placeholder) return placeholder;
  if (mode === "time") return "HH:mm";

  return dateFormat; // 수정됨
};

const formatPickerValue = (
  mode: DateTimePickerMode,
  date: Date | null,
  dateFormat: string, // 수정됨
) => {
  if (mode === "time") return formatTime(date);

  return formatDateTime(date, dateFormat); // 수정됨
};

const parsePickerValue = (
  mode: DateTimePickerMode,
  value: string,
  dateFormat: string, // 수정됨
) => {
  if (mode === "time") return parseTime(value);

  return parseDateTime(value, dateFormat); // 수정됨
};

const normalizePickerValue = (
  mode: DateTimePickerMode,
  value: Date | string | null,
  dateFormat: string, // 수정됨
) => {
  if (mode === "time") return normalizeTimeValue(value);

  return normalizeDateTimeValue(value, dateFormat); // 수정됨
};

/**
 * 날짜 달력과 시/분 선택 컬럼을 함께 보여주는 단일 날짜/시간 선택 컴포넌트.
 */
export const DateTimePicker = ({
  mode = "dateTime",
  value,
  disabled = false,
  placeholder,
  minuteStep = 5,
  dateFormat = DATE_TIME_FORMAT, // 수정됨
  showMonthYearPicker = false,
  minDate,
  maxDate,
  onChange,
}: DateTimePickerProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  const externalSelectedDate = useMemo(
    () => normalizePickerValue(mode, value, dateFormat), // 수정됨
    [dateFormat, mode, value], // 수정됨
  );
  const displayValue = formatPickerValue(
    mode,
    externalSelectedDate,
    dateFormat,
  ); // 수정됨
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => externalSelectedDate,
  );
  const [inputValue, setInputValue] = useState(displayValue);
  const inputPlaceholder = getPlaceholder(mode, placeholder, dateFormat); // 수정됨
  const selectedDisplayValue = formatPickerValue(
    mode,
    selectedDate,
    dateFormat,
  ); // 수정됨

  useEffect(() => {
    setSelectedDate(externalSelectedDate);
    setInputValue(displayValue);
  }, [displayValue, externalSelectedDate]);

  const isDateSelectable = useCallback(
    (date: Date) => {
      if (mode === "time") return true;

      if (minDate && date < minDate) return false;
      if (maxDate && date > maxDate) return false;

      return true;
    },
    [maxDate, minDate, mode],
  );

  // 수정됨: 날짜를 선택했을 때 기존 선택 시간이 minDate/maxDate 범위를 벗어나면 가장 가까운 제한값으로 보정한다.
  const clampDateTimeToRange = useCallback(
    (date: Date) => {
      if (mode === "time") return date;

      if (minDate && date < minDate) return minDate;
      if (maxDate && date > maxDate) return maxDate;

      return date;
    },
    [maxDate, minDate, mode],
  );

  const commitInputValue = useCallback(
    (nextInputValue: string) => {
      if (disabled) return;

      const trimmedValue = nextInputValue.trim();

      if (!trimmedValue) {
        setSelectedDate(null);
        setInputValue("");
        if (selectedDisplayValue) onChange("");
        return;
      }

      const nextDate = parsePickerValue(mode, trimmedValue, dateFormat); // 수정됨
      if (!nextDate || !isDateSelectable(nextDate)) {
        setInputValue(selectedDisplayValue);
        return;
      }

      const nextValue = formatPickerValue(mode, nextDate, dateFormat); // 수정됨
      setSelectedDate(nextDate);
      setInputValue(nextValue);
      if (nextValue === selectedDisplayValue) return;

      onChange(nextValue);
    },
    [
      dateFormat,
      disabled,
      isDateSelectable,
      mode,
      onChange,
      selectedDisplayValue,
    ], // 수정됨
  );

  const closePicker = useCallback(() => {
    setIsOpen(false);
    pickerRef.current?.setOpen(false);
  }, []);

  useEffect(() => {
    if (disabled) {
      closePicker();
    }
  }, [closePicker, disabled]);

  const handleInputValueChange = useCallback(
    (nextInputValue: string) => {
      if (disabled) return;

      setInputValue(nextInputValue);
    },
    [disabled],
  );

  const emitPickerChange = useCallback(
    (nextDate: Date | null) => {
      const nextValue = formatPickerValue(mode, nextDate, dateFormat); // 수정됨

      setSelectedDate(nextDate);
      setInputValue(nextValue);
      onChange(nextValue);
    },
    [dateFormat, mode, onChange], // 수정됨
  );

  const handleDateChange = useCallback(
    (nextDate: Date | null, event?: SyntheticEvent<HTMLElement>) => {
      if (disabled) return;

      if (!nextDate) {
        emitPickerChange(null);
        return;
      }

      const isTextInputChange = event?.type === "change";
      const inputValue =
        "value" in (event?.target ?? {})
          ? String((event?.target as HTMLInputElement).value)
          : "";

      if (isTextInputChange && inputValue) {
        commitInputValue(inputValue);
        return;
      }

      const selectedHour = isTextInputChange
        ? nextDate.getHours()
        : (selectedDate?.getHours() ?? 0);
      const selectedMinute = isTextInputChange
        ? nextDate.getMinutes()
        : (selectedDate?.getMinutes() ?? 0);
      const nextDateTime = DateTime.fromJSDate(nextDate)
        .set({
          hour: selectedHour,
          millisecond: 0,
          minute: selectedMinute,
          second: 0,
        })
        .toJSDate();

      emitPickerChange(clampDateTimeToRange(nextDateTime)); // 수정됨
    },
    [
      clampDateTimeToRange, // 수정됨
      commitInputValue,
      disabled,
      emitPickerChange,
      selectedDate,
    ],
  );

  const handleHourChange = useCallback(
    (hour: number) => {
      if (disabled) return;

      const nextDate = setDateTimePart(selectedDate, "hour", hour); // 수정됨
      if (!isDateSelectable(nextDate)) return; // 수정됨

      emitPickerChange(nextDate); // 수정됨
    },
    [disabled, emitPickerChange, isDateSelectable, selectedDate], // 수정됨
  );

  const handleMinuteChange = useCallback(
    (minute: number) => {
      if (disabled) return;

      const nextDate = setDateTimePart(selectedDate, "minute", minute); // 수정됨
      if (!isDateSelectable(nextDate)) return; // 수정됨

      emitPickerChange(nextDate); // 수정됨
    },
    [disabled, emitPickerChange, isDateSelectable, selectedDate], // 수정됨
  );

  useEffect(() => {
    if (mode !== "time" || !isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isOpen, mode]);

  const openTimePicker = useCallback(() => {
    if (disabled) return;

    setIsOpen(true);
  }, [disabled]);

  const handleTimeInputBlur = useCallback(() => {
    requestAnimationFrame(() => {
      if (!rootRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    });
  }, []);

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
                minDate={minDate} // 수정됨
                minuteStep={minuteStep}
                maxDate={maxDate} // 수정됨
                selectedDate={selectedDate}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            </div>
          </CalendarContainer>
        );
      },
    [
      handleHourChange,
      handleMinuteChange,
      maxDate, // 수정됨
      minDate, // 수정됨
      minuteStep,
      selectedDate,
    ],
  );

  if (mode === "time") {
    return (
      <div className="dateTimePicker dateTimePickerTimeOnly" ref={rootRef}>
        <DateTimeInput
          ariaLabel="시간"
          disabled={disabled}
          iconType="time"
          isOpen={isOpen}
          onBlur={handleTimeInputBlur}
          onClear={() => emitPickerChange(null)}
          onClick={openTimePicker}
          onFocus={openTimePicker}
          onInputCommit={commitInputValue}
          onInputValueChange={handleInputValueChange}
          placeholder={inputPlaceholder}
          value={inputValue}
        />

        {isOpen ? (
          <div className="dateTimeTimePopper">
            <DateTimePanel
              minDate={minDate} // 수정됨
              minuteStep={minuteStep}
              maxDate={maxDate} // 수정됨
              selectedDate={selectedDate}
              onHourChange={handleHourChange}
              onMinuteChange={handleMinuteChange}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // 수정됨: showMonthYearPicker와 dateFormat을 ReactDatePicker에 전달하는 방식으로 단순화한다.
  return (
    <div className="dateTimePicker" ref={rootRef}>
      <ReactDatePicker
        calendarClassName="dateTimeCalendar"
        calendarContainer={showMonthYearPicker ? undefined : calendarContainer}
        customInput={
          <DateTimeInput
            disabled={disabled}
            isOpen={isOpen}
            onClear={() => emitPickerChange(null)}
            onInputCommit={commitInputValue}
            onInputValueChange={handleInputValueChange}
            outsideClickIgnoreClassName={
              DATE_TIME_INPUT_OUTSIDE_CLICK_IGNORE_CLASS
            }
            placeholder={inputPlaceholder}
          />
        }
        dateFormat={dateFormat}
        dateFormatCalendar="yyyy MM"
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
        outsideClickIgnoreClass={DATE_TIME_INPUT_OUTSIDE_CLICK_IGNORE_CLASS}
        placeholderText={inputPlaceholder}
        popperClassName="dateTimePopper"
        popperPlacement="bottom-start"
        ref={pickerRef}
        selected={selectedDate}
        shouldCloseOnSelect={false}
        showMonthYearPicker={showMonthYearPicker}
        showPopperArrow={false}
        strictParsing
        value={inputValue}
        open={disabled ? false : undefined}
      />
    </div>
  );
};
