export type MemberStatus = "이용 중" | "휴면";

export type MemberSummary = {
  id: string;
  name: string;
  status: MemberStatus;
};

export type MemberFilterState = {
  keyword: string;
};

export const INITIAL_MEMBER_FILTER_STATE: MemberFilterState = {
  keyword: "",
};

export type MemberFilterParams = {
  keyword?: string;
};

export const INITIAL_MEMBER_FILTER_PARAMS: MemberFilterParams = {};

export const toMemberFilterParams = (
  filter: MemberFilterState,
): MemberFilterParams => {
  const keyword = filter.keyword.trim();

  return {
    keyword: keyword || undefined,
  };
};

export const toMemberFilterState = (
  filterParams: MemberFilterParams,
): MemberFilterState => {
  return {
    keyword: filterParams.keyword ?? "",
  };
};
