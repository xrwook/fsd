import type { MemberListRequest } from "../api/getMemberList";
import type { MemberFilterState } from "../model/member";

export const toApiParams = (
  filter: MemberFilterState,
): MemberListRequest["query"] => ({
  keyword: filter.keyword.trim() || undefined,
});
