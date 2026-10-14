import { DateTime } from "luxon";

export const toRelativeTimeText = (value: string | null) => {
  if (!value) return;

  const dateTime = DateTime.fromISO(value).setLocale("ko");

  return dateTime.isValid ? (dateTime.toRelative() ?? undefined) : undefined;
};
