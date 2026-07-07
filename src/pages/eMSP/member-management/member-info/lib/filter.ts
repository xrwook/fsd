import type { MemberListRequest } from "../api/getMemberList";
import type { MemberFilterState } from "../model/member";

export const toApiParams = (
  filter: MemberFilterState,
): MemberListRequest["query"] => ({
  endDate: filter.endDate || undefined,
  keyword: filter.keyword.trim() || undefined,
  startDate: filter.startDate || undefined,
});
