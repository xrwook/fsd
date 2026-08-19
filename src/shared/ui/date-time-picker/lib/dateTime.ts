import { DateTime } from "luxon";

export const DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm";
export const TIME_FORMAT = "HH:mm";

export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

// 수정됨: 전달받은 dateFormat으로 날짜를 문자열로 변환한다.
export const formatDateTime = (
  date: Date | null,
  dateFormat = DATE_TIME_FORMAT,
): string => {
  if (!isValidDate(date)) return "";

  return DateTime.fromJSDate(date).toFormat(dateFormat);
};

// 수정됨: 전달받은 dateFormat으로 직접 입력한 날짜 문자열을 파싱한다.
export const parseDateTime = (
  value: string,
  dateFormat = DATE_TIME_FORMAT,
): Date | null => {
  const date = DateTime.fromFormat(value, dateFormat);

  return date.isValid ? date.toJSDate() : null;
};

export const formatTime = (date: Date | null): string => {
  if (!isValidDate(date)) return "";

  return DateTime.fromJSDate(date).toFormat(TIME_FORMAT);
};

export const parseTime = (value: string): Date | null => {
  const time = DateTime.fromFormat(value, TIME_FORMAT);

  if (!time.isValid) return null;

  return DateTime.now()
    .startOf("day")
    .set({ hour: time.hour, minute: time.minute })
    .toJSDate();
};

// 수정됨: 문자열 value도 전달받은 dateFormat 기준으로 정규화한다.
export const normalizeDateTimeValue = (
  value: unknown,
  dateFormat = DATE_TIME_FORMAT,
): Date | null => {
  if (isValidDate(value)) return value;
  if (typeof value === "string") return parseDateTime(value, dateFormat);

  return null;
};

export const normalizeTimeValue = (value: unknown): Date | null => {
  if (isValidDate(value)) return value;
  if (typeof value === "string")
    return parseTime(value) ?? parseDateTime(value);

  return null;
};

export const padTimeUnit = (value: number): string =>
  value.toString().padStart(2, "0");

export const getMinuteOptions = (minuteStep: number): number[] => {
  const safeMinuteStep =
    Number.isInteger(minuteStep) && minuteStep > 0
      ? Math.min(minuteStep, 60)
      : 5;
  const options: number[] = [];

  for (let minute = 0; minute < 60; minute += safeMinuteStep) {
    options.push(minute);
  }

  const lastMinute = options.at(-1) ?? 0;

  for (let minute = lastMinute + 1; minute < 60; minute += 1) {
    options.push(minute);
  }

  return options;
};

export const setDateTimePart = (
  selectedDate: Date | null,
  part: "hour" | "minute",
  value: number,
): Date => {
  const baseDate = isValidDate(selectedDate)
    ? DateTime.fromJSDate(selectedDate)
    : DateTime.now().startOf("day");
  const nextDate =
    part === "hour"
      ? baseDate.set({ hour: value })
      : baseDate.set({ minute: value });

  return nextDate.set({ millisecond: 0, second: 0 }).toJSDate();
};
