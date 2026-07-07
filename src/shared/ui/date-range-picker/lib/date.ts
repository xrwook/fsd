import { DateTime } from "luxon";

const DATE_FORMAT = "yyyy-MM-dd";

export const parseDate = (value: string): Date | null => {
  const date = DateTime.fromFormat(value, DATE_FORMAT);

  return date.isValid ? date.toJSDate() : null;
};

export const formatDate = (date: Date | null): string => {
  if (!date) {
    return "";
  }

  return DateTime.fromJSDate(date).toFormat(DATE_FORMAT);
};

export const startOfToday = (): Date => DateTime.local().startOf("day").toJSDate();

export const addDays = (date: Date, amount: number): Date =>
  DateTime.fromJSDate(date).plus({ days: amount }).toJSDate();

export const addMonths = (date: Date, amount: number): Date =>
  DateTime.fromJSDate(date).plus({ months: amount }).toJSDate();
