export const MEMBER_STATUSES = ["이용 중", "휴면"] as const;

export type TMemberStatus = (typeof MEMBER_STATUSES)[number];

export type TMemberSummary = {
  id: string;
  name: string;
  status: TMemberStatus;
};

export type TMemberListSearchParams = {
  keyword: string;
  status: TMemberStatus | "";
};

export const isMemberStatus = (value: string): value is TMemberStatus => {
  return (MEMBER_STATUSES as readonly string[]).includes(value);
};
