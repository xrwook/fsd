import "react-datepicker/dist/react-datepicker.css";
import "../assets/calendar.css";

import clsx from "clsx";
import { DateTime } from "luxon";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDatePicker from "react-datepicker";

export type CalendarDateValue = Date | string;

export type CalendarProps = {
  /** 처음 표시할 월의 기준 날짜 */
  displayDate?: CalendarDateValue;
  /** 원형으로 강조할 날짜 목록 */
  markedDates?: readonly CalendarDateValue[];
  /** 최상위 요소에 추가할 class */
  className?: string;
  /** 달력을 여는 버튼 문구 */
  buttonLabel?: string;
  /** 달력 버튼에 추가할 class */
  buttonClassName?: string;
  /** 달력 접근성 이름 */
  ariaLabel?: string;
  /** 이전/다음 월 이동 시 호출 */
  onMonthChange?: (date: Date) => void;
};

const normalizeDate = (value: CalendarDateValue | undefined): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : DateTime.fromJSDate(value).startOf("day").toJSDate();
  }

  if (!value) return null;

  const parsedDate = DateTime.fromISO(value);
  return parsedDate.isValid ? parsedDate.startOf("day").toJSDate() : null;
};

const getDateKey = (date: Date): string =>
  DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");

const ignoreDateChange = () => false;

/**
 * 트리거와 분리해 어디서든 열 수 있는 읽기 전용 월 달력.
 */
export const Calendar = ({
  displayDate,
  markedDates = [],
  className,
  buttonLabel = "일정 보기",
  buttonClassName,
  ariaLabel = "달력",
  onMonthChange,
}: CalendarProps) => {
  const calendarId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedMarkedDates = useMemo(
    () => markedDates.flatMap((date) => normalizeDate(date) ?? []),
    [markedDates],
  );
  const markedDateKeys = useMemo(
    () => new Set(normalizedMarkedDates.map((date) => getDateKey(date))),
    [normalizedMarkedDates],
  );
  const calendarDate =
    normalizeDate(displayDate) ?? normalizedMarkedDates[0] ?? new Date();
  const calendarMonthKey =
    DateTime.fromJSDate(calendarDate).toFormat("yyyy-MM");
  const getDayClassName = useCallback(
    (date: Date) =>
      markedDateKeys.has(getDateKey(date)) ? "calendarDayMarked" : "",
    [markedDateKeys],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [isOpen]);

  return (
    <div className={clsx("calendar", className)} ref={rootRef}>
      <button
        aria-controls={isOpen ? calendarId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={clsx("calendarTrigger", buttonClassName)}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
      >
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          aria-label={ariaLabel}
          aria-readonly="true"
          className="calendarPopover"
          id={calendarId}
          role="dialog"
        >
          <ReactDatePicker
            key={calendarMonthKey}
            calendarClassName="calendarPanel"
            dateFormatCalendar="yyyy MM"
            dayClassName={getDayClassName}
            disabledKeyboardNavigation
            inline
            onChange={ignoreDateChange}
            onMonthChange={onMonthChange}
            openToDate={calendarDate}
            readOnly
            selected={null}
            shouldCloseOnSelect={false}
          />
        </div>
      ) : null}
    </div>
  );
};
