import { DateTime } from "luxon";

export const DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm";

export const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

export const formatDateTime = (date: Date | null): string => {
  if (!isValidDate(date)) return "";

  return DateTime.fromJSDate(date).toFormat(DATE_TIME_FORMAT);
};

export const parseDateTime = (value: string): Date | null => {
  const date = DateTime.fromFormat(value, DATE_TIME_FORMAT);

  return date.isValid ? date.toJSDate() : null;
};

export const normalizeDateTimeValue = (value: unknown): Date | null => {
  if (isValidDate(value)) return value;
  if (typeof value === "string") return parseDateTime(value);

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
