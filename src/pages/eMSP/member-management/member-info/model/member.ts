export type MemberStatus = "이용 중" | "휴면";

export type MemberSummary = {
  id: string;
  name: string;
  status: MemberStatus;
};

export type MemberFilterState = {
  endDate: string;
  keyword: string;
  startDate: string;
};

export const INITIAL_MEMBER_FILTER_STATE: MemberFilterState = {
  endDate: "",
  keyword: "",
  startDate: "",
};
