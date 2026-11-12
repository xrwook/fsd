
import { DateTime } from 'luxon';

export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const TIME_FORMAT = 'HH:mm';
export const TIME_COMPACT_FORMAT = 'HHmm';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const YEAR_MONTH_FORMAT = 'yyyy-MM';

export const isValidDate = (value: unknown): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

export const formatDateTime = (date: Date | null, format = DATE_TIME_FORMAT): string => {
  if (!isValidDate(date)) return '';

  return DateTime.fromJSDate(date).toFormat(format);
};

export const parseDateTime = (value: string, format = DATE_TIME_FORMAT): Date | null => {
  const date = DateTime.fromFormat(value, format);

  return date.isValid ? date.toJSDate() : null;
};

export const formatTime = (date: Date | null): string => {
  if (!isValidDate(date)) return '';

  return DateTime.fromJSDate(date).toFormat(TIME_FORMAT);
};

export const parseTime = (value: string): Date | null => {
  const time = DateTime.fromFormat(value, TIME_FORMAT);

  if (!time.isValid) return null;

  return DateTime.now().startOf('day').set({ hour: time.hour, minute: time.minute }).toJSDate();
};

export const normalizeDateTimeValue = (value: unknown, format = DATE_TIME_FORMAT): Date | null => {
  if (isValidDate(value)) return value;
  if (typeof value === 'string') return parseDateTime(value, format);

  return null;
};

export const normalizeTimeValue = (value: unknown): Date | null => {
  if (isValidDate(value)) return value;
  if (typeof value === 'string') return parseTime(value) ?? parseDateTime(value);

  return null;
};

export const padTimeUnit = (value: number): string => value.toString().padStart(2, '0');

export const getMinuteOptions = (minuteStep: number): number[] => {
  const safeMinuteStep = Number.isInteger(minuteStep) && minuteStep > 0 ? Math.min(minuteStep, 60) : 5;
  const options: number[] = [];

  for (let minute = 0; minute < 60; minute += safeMinuteStep) {
    options.push(minute);
  }

  return options;
};

export const setDateTimePart = (selectedDate: Date | null, part: 'hour' | 'minute', value: number): Date => {
  const baseDate = isValidDate(selectedDate) ? DateTime.fromJSDate(selectedDate) : DateTime.now().startOf('day');
  const nextDate = part === 'hour' ? baseDate.set({ hour: value }) : baseDate.set({ minute: value });

  return nextDate.set({ millisecond: 0, second: 0 }).toJSDate();
};
