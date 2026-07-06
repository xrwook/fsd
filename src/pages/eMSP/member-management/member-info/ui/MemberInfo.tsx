import { Stack, Typography } from "@mui/material";
import { useMemo } from "react";

import { useListNavigation, useUrlSearchParams } from "@/shared/lib/router";

import { useGetMemberListQuery } from "../api/getMemberList";
import {
  INITIAL_MEMBER_FILTER_PARAMS,
  type MemberFilterState,
  toMemberFilterParams,
  toMemberFilterState,
} from "../model/member";
import { MemberInfoFilter } from "./MemberInfoFilter";
import { MemberInfoTable } from "./MemberInfoTable";

const MemberInfo = () => {
  const { goToDetail } = useListNavigation();
  const [filterParams, setFilterParams] = useUrlSearchParams(
    INITIAL_MEMBER_FILTER_PARAMS,
  );
  const initialFilter = useMemo(
    () => toMemberFilterState(filterParams),
    [filterParams],
  );

  const {
    data: members = [],
    isError,
    isPending,
    refetch,
  } = useGetMemberListQuery(filterParams);

  const handleSearch = (filter: MemberFilterState) => {
    setFilterParams(toMemberFilterParams(filter));
  };

  const handleReset = () => {
    setFilterParams(INITIAL_MEMBER_FILTER_PARAMS);
  };

  const handleOpenDetail = (memberId: string) => {
    goToDetail(memberId, filterParams);
  };

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        회원 정보
      </Typography>

      <MemberInfoFilter
        initialFilter={initialFilter}
        onReset={handleReset}
        onSearch={handleSearch}
      />

      <MemberInfoTable
        isError={isError}
        isPending={isPending}
        members={members}
        onOpenDetail={handleOpenDetail}
        onRetry={() => void refetch()}
      />
    </Stack>
  );
};

export default MemberInfo;
