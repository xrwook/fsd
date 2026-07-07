import { DateTime } from "luxon";

const DATE_FORMAT = "yyyy-MM-dd";

export type DateRange = {
  endDate: Date;
  startDate: Date;
};

/** yyyy-MM-dd 문자열을 Date로 변환한다. 유효하지 않은 날짜면 null을 반환한다. */
export const parseDate = (value: string): Date | null => {
  const date = DateTime.fromFormat(value, DATE_FORMAT);

  return date.isValid ? date.toJSDate() : null;
};

/** Date 값을 API/URL에서 쓰기 쉬운 yyyy-MM-dd 문자열로 변환한다. */
export const formatDate = (date: Date | null): string => {
  if (!date) {
    return "";
  }

  return DateTime.fromJSDate(date).toFormat(DATE_FORMAT);
};

/** 현재 시각을 제거한 오늘 00:00 Date를 반환한다. */
export const startOfToday = (): Date =>
  DateTime.local().startOf("day").toJSDate();

/** 날짜에 일 단위 기간을 더한다. 음수를 넘기면 이전 날짜를 계산한다. */
export const addDays = (date: Date, amount: number): Date =>
  DateTime.fromJSDate(date).plus({ days: amount }).toJSDate();

/** 날짜에 월 단위 기간을 더한다. 음수를 넘기면 이전 달을 계산한다. */
export const addMonths = (date: Date, amount: number): Date =>
  DateTime.fromJSDate(date).plus({ months: amount }).toJSDate();

/**
 * 시작일/종료일 순서가 뒤집혀 들어와도 항상 startDate <= endDate 형태로 정렬한다.
 * 날짜 비교는 시간 영향을 제거하기 위해 day 단위로 처리한다.
 */
export const toOrderedDateRange = (
  startDate: Date,
  endDate: Date,
): DateRange => {
  const startDateTime = toStartOfDay(startDate);
  const endDateTime = toStartOfDay(endDate);

  return startDateTime.toMillis() <= endDateTime.toMillis()
    ? {
        endDate: endDateTime.toJSDate(),
        startDate: startDateTime.toJSDate(),
      }
    : {
        endDate: startDateTime.toJSDate(),
        startDate: endDateTime.toJSDate(),
      };
};

/** 두 날짜 구간이 하루라도 겹치는지 확인한다. */
export const isDateRangeOverlapping = (
  dateRange: DateRange,
  targetDateRange: DateRange,
): boolean => {
  const start = toStartOfDay(dateRange.startDate).toMillis();
  const end = toStartOfDay(dateRange.endDate).toMillis();
  const targetStart = toStartOfDay(targetDateRange.startDate).toMillis();
  const targetEnd = toStartOfDay(targetDateRange.endDate).toMillis();

  return start <= targetEnd && targetStart <= end;
};

/** Date를 Luxon DateTime으로 바꾸면서 시간은 00:00으로 맞춘다. */
const toStartOfDay = (date: Date): DateTime =>
  DateTime.fromJSDate(date).startOf("day");
