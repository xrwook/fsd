
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/date-time-picker.css';

import clsx from 'clsx';
import { DateTime } from 'luxon';
import type { SyntheticEvent } from 'react';
import { type ComponentProps, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import ReactDatePicker, { CalendarContainer } from 'react-datepicker';

import type { TIME_COMPACT_FORMAT, YEAR_MONTH_FORMAT } from '../lib/dateTime';
import { type TIME_FORMAT } from '../lib/dateTime';
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  formatDateTime,
  formatTime,
  normalizeDateTimeValue,
  normalizeTimeValue,
  parseDateTime,
  parseTime,
  setDateTimePart,
} from '../lib/dateTime';
import { DateTimeInput } from './_DateTimeInput';
import { DateTimePanel } from './_DateTimePanel';

export type DateTimePickerMode = 'date' | 'dateTime' | 'time';
export type DateFormatType =
  | typeof DATE_FORMAT
  | typeof DATE_TIME_FORMAT
  | typeof TIME_COMPACT_FORMAT
  | typeof TIME_FORMAT
  | typeof YEAR_MONTH_FORMAT;

export type DateTimePickerProps = {
  mode?: DateTimePickerMode;
  value: string | Date | null;
  // value: Date | null;
  disabled?: boolean;
  placeholder?: string;
  /** 분 선택 간격 */
  minuteStep?: number;
  /** 최소 날짜 */
  minDate?: Date;
  /** 최대 날짜 */
  maxDate?: Date;
  /** date format */
  dateFormat?: DateFormatType;
  /** 년, 월 용 달력 */
  showMonthYearPicker?: boolean;
  /** error */
  error?: boolean;
  /** helpText */
  helpText?: string;
  /** helpText */
  clearable?: boolean;
  /** onChange 시 return format type */
  outputFormat?: DateFormatType;
  /** 수정: outputFormat 지정 시 해당 형식으로 반환하며, 값을 지우면 빈 문자열을 반환한다. */
  onChange: (value: string) => void;
};

const getPlaceholder = (mode: DateTimePickerMode, placeholder: string | undefined, dateFormat: string) => {
  if (placeholder) return placeholder;
  if (mode === 'time') return 'HH:mm';

  return dateFormat;
};

const formatPickerValue = (mode: DateTimePickerMode, date: Date | null, dateFormat: string) => {
  if (mode === 'time') {
    return formatTime(date);
  }
  return formatDateTime(date, dateFormat);
};

const parsePickerValue = (mode: DateTimePickerMode, value: string, dateFormat: string) => {
  if (mode === 'time') {
    return parseTime(value);
  }
  return parseDateTime(value, dateFormat);
};

const normalizePickerValue = (
  mode: DateTimePickerMode,
  value: string | Date | null,
  dateFormat: string,
  outputFormat?: DateFormatType
) => {
  if (outputFormat) {
    // 수정
    const outputDate = normalizeDateTimeValue(value, outputFormat);
    if (outputDate) return outputDate;
  }

  if (mode === 'time') {
    // 수정: 외부 시간 값은 dateFormat으로 먼저 읽고 기존 시간 형식도 허용한다.
    return normalizeDateTimeValue(value, dateFormat) ?? normalizeTimeValue(value);
  }
  return normalizeDateTimeValue(value, dateFormat);
};

export const DateTimePicker = ({
  mode = 'dateTime',
  value,
  disabled = false,
  placeholder,
  minuteStep = 5,
  minDate,
  maxDate,
  dateFormat = mode === 'date' ? DATE_FORMAT : DATE_TIME_FORMAT,
  showMonthYearPicker = false,
  error,
  helpText,
  clearable = true,
  outputFormat,
  onChange,
}: DateTimePickerProps) => {
  const instanceId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<ReactDatePicker>(null);
  const [isOpen, setIsOpen] = useState(false);
  // 수정
  const externalSelectedDate = useMemo(
    () => normalizePickerValue(mode, value, dateFormat, outputFormat),
    [mode, value, dateFormat, outputFormat],
  );
  const displayValue = formatPickerValue(mode, externalSelectedDate, dateFormat);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => externalSelectedDate);
  const [inputValue, setInputValue] = useState(displayValue);
  const inputPlaceholder = getPlaceholder(mode, placeholder, dateFormat);
  const selectedDisplayValue = formatPickerValue(mode, selectedDate, dateFormat);
  const outsideClickIgnore = `outsideClickIgnore-${instanceId}`;

  useEffect(() => {
    setSelectedDate(externalSelectedDate);
    setInputValue(displayValue);
  }, [displayValue, externalSelectedDate]);

  const isDateSelectable = useCallback(
    (date: Date) => {
      if (mode === 'time') return true;
      if (minDate && date < minDate) return false;
      if (maxDate && date > maxDate) return false;

      return true;
    },
    [maxDate, minDate, mode],
  );

  const clampDateTimeToRange = useCallback(
    (date: Date) => {
      if (mode === 'time') return date;
      if (minDate && date < minDate) return minDate;
      if (maxDate && date > maxDate) return maxDate;
      return date;
    },
    [mode, maxDate, minDate],
  );

  const commitInputValue = useCallback(
    (nextInputValue: string) => {
      if (disabled) return;

      const trimmedValue = nextInputValue.trim();

      if (!trimmedValue) {
        setSelectedDate(null);
        setInputValue('');
        if (selectedDisplayValue) onChange('');
        return;
      }

      const nextDate = parsePickerValue(mode, trimmedValue, dateFormat);
      if (!nextDate || !isDateSelectable(nextDate)) {
        setInputValue(selectedDisplayValue);
        return;
      }

      const nextValue = formatPickerValue(mode, nextDate, dateFormat);
      setSelectedDate(nextDate);
      setInputValue(nextValue);
      if (nextValue === selectedDisplayValue) return;

      onChange(outputFormat ? formatDateTime(nextDate, outputFormat) : nextValue); // 수정
    },
    [disabled, isDateSelectable, mode, onChange, selectedDisplayValue, dateFormat, outputFormat], // 수정
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
      const nextValue = formatPickerValue(mode, nextDate, dateFormat);

      setSelectedDate(nextDate);
      setInputValue(nextValue);
      onChange(outputFormat ? formatDateTime(nextDate, outputFormat) : nextValue); // 수정
    },
    [mode, onChange, dateFormat, outputFormat], // 수정
  );

  const handleDateChange = useCallback(
    (nextDate: Date | null, event?: SyntheticEvent<HTMLElement>) => {
      if (disabled) return;

      if (!nextDate) {
        emitPickerChange(null);
        return;
      }

      const isTextInputChange = event?.type === 'change';
      const inputValue = 'value' in (event?.target ?? {}) ? String((event?.target as HTMLInputElement).value) : '';

      if (isTextInputChange && inputValue) {
        commitInputValue(inputValue);
        return;
      }

      const selectedHour = isTextInputChange ? nextDate.getHours() : (selectedDate?.getHours() ?? 0);
      const selectedMinute = isTextInputChange ? nextDate.getMinutes() : (selectedDate?.getMinutes() ?? 0);
      const nextDateTime = DateTime.fromJSDate(nextDate)
        .set({
          hour: selectedHour,
          millisecond: 0,
          minute: selectedMinute,
          second: 0,
        })
        .toJSDate();

      emitPickerChange(clampDateTimeToRange(nextDateTime));
    },
    [commitInputValue, disabled, emitPickerChange, selectedDate, clampDateTimeToRange],
  );

  const handleHourChange = useCallback(
    (hour: number) => {
      if (disabled) return;
      const nextDate = setDateTimePart(selectedDate, 'hour', hour);
      if (!isDateSelectable(nextDate)) return;

      emitPickerChange(nextDate);
    },
    [disabled, emitPickerChange, selectedDate, isDateSelectable],
  );

  const handleMinuteChange = useCallback(
    (minute: number) => {
      if (disabled) return;
      const nextDate = setDateTimePart(selectedDate, 'minute', minute);
      if (!isDateSelectable(nextDate)) return;

      emitPickerChange(nextDate);
    },
    [disabled, emitPickerChange, selectedDate, isDateSelectable],
  );

  useEffect(() => {
    if (mode !== 'time' || !isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
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
      function DateTimeCalendarContainer({ children, ...containerProps }: ComponentProps<typeof CalendarContainer>) {
        return (
          <CalendarContainer {...containerProps}>
            <div className="dateTimeCalendarLayout">
              <div className="dateTimeMonthPane">{children}</div>
              <DateTimePanel
                minDate={minDate}
                maxDate={maxDate}
                minuteStep={minuteStep}
                selectedDate={selectedDate}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            </div>
          </CalendarContainer>
        );
      },
    [handleHourChange, handleMinuteChange, minuteStep, selectedDate, minDate, maxDate],
  );

  if (mode === 'time') {
    return (
      <div className="dateTimePickerField">
        <div className={clsx('dateTimePicker', 'dateTimePickerTimeOnly', error && 'datePickerError')} ref={rootRef}>
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
            clearable={clearable}
          />

          {isOpen ? (
            <div className="dateTimeTimePopper">
              <DateTimePanel
                minDate={minDate}
                maxDate={maxDate}
                minuteStep={minuteStep}
                selectedDate={selectedDate}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            </div>
          ) : null}
        </div>
        {helpText && <p className={clsx('datePickerHelpText', error && 'datePickerHelpTextError')}>{helpText}</p>}
      </div>
    );
  }

  return (
    <div className="dateTimePickerField">
      <div className={clsx(mode === 'dateTime' ? 'dateTimePicker' : 'datePicker', error && 'datePickerError')}>
        <ReactDatePicker
          // calendarClassName="dateTimeCalendar"
          calendarClassName={clsx('dateTimeCalendar', mode === 'date' && 'dateCalendar')}
          calendarContainer={showMonthYearPicker || mode === 'date' ? undefined : calendarContainer}
          placeholderText={placeholder}
          customInput={
            <DateTimeInput
              disabled={disabled}
              isOpen={isOpen}
              onClear={() => emitPickerChange(null)}
              onInputCommit={commitInputValue}
              onInputValueChange={handleInputValueChange}
              outsideClickIgnoreClass={outsideClickIgnore}
              clearable={clearable}
              // placeholder={placeholder}
            />
          }
          dateFormat={dateFormat}
          dateFormatCalendar="yyyy MM"
          disabled={disabled}
          showMonthYearPicker={showMonthYearPicker}
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
          outsideClickIgnoreClass={outsideClickIgnore}
          popperClassName="dateTimePopper"
          popperPlacement="bottom-start"
          ref={pickerRef}
          selected={selectedDate}
          shouldCloseOnSelect={false}
          showPopperArrow={false}
          strictParsing
          value={inputValue}
          open={disabled ? false : undefined}
        />
      </div>
      {helpText && <p className={clsx('datePickerHelpText', error && 'datePickerHelpTextError')}>{helpText}</p>}
    </div>
  );
};
