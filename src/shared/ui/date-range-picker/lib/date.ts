import { DateTime } from "luxon";

import {
  type DateQuickRange,
  isAllQuickRange,
  type QuickRange,
} from "../config/quickRanges";

const DATE_FORMAT = "yyyy-MM-dd";

export type DateRange = {
  endDate: Date;
  startDate: Date;
};

export type RangeDirection = "future" | "past";

export type DisabledRange = {
  endDate: string;
  startDate: string;
};

type DisabledInterval = {
  end: Date;
  start: Date;
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

/**
 * 빠른 기간 계산의 기준일을 정한다.
 * past는 종료일 기준, future는 시작일 기준이 자연스럽고,
 * 선택된 날짜가 없으면 오늘을 기준으로 계산한다.
 */
export const getQuickRangeBaseDate = (
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
export const getQuickRanges = (
  quickRanges: QuickRange[],
  direction: RangeDirection,
  baseDate: Date,
  disabledInterval: DisabledInterval[],
): Array<QuickRange & { disabled: boolean }> =>
  quickRanges.map((quickRange) => {
    if (isAllQuickRange(quickRange)) {
      return {
        ...quickRange,
        disabled: false,
      };
    }

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
export const getQuickRangeDates = (
  quickRange: DateQuickRange,
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
export const getDisabledInterval = (
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

/** Date를 Luxon DateTime으로 바꾸면서 시간은 00:00으로 맞춘다. */
const toStartOfDay = (date: Date): DateTime =>
  DateTime.fromJSDate(date).startOf("day");
