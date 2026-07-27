import { Stack, Typography } from "@mui/material";
import { useCallback, useState } from "react";

import { navigateToScreen } from "@/shared/lib/navigation";
import { useListNavigation } from "@/shared/lib/router";

import {
  type MemberListRequest,
  useGetMemberListQuery,
} from "../api/getMemberList";
import { toApiParams } from "../lib/filter";
import type { MemberFilterState } from "../model/member";
import { MemberInfoFilter } from "./MemberInfoFilter";
import { MemberInfoTable } from "./MemberInfoTable";

type FilterQuery = MemberListRequest["query"];

const INITIAL_FILTER_PARAMS: FilterQuery = {};

const MemberInfo = () => {
  const { goToDetail } = useListNavigation();
  const [filterParams, setFilterParams] = useState<FilterQuery>(
    INITIAL_FILTER_PARAMS,
  );

  const {
    data: members = [],
    isError,
    isPending,
    refetch,
  } = useGetMemberListQuery({
    query: { ...filterParams },
  });

  const handleSearch = useCallback((filter: MemberFilterState) => {
    setFilterParams(toApiParams(filter));
  }, []);

  const handleReset = () => {
    setFilterParams(INITIAL_FILTER_PARAMS);
  };

  const handleOpenDetail = useCallback(
    (memberId: string) => {
      goToDetail(memberId, filterParams);
    },
    [filterParams, goToDetail],
  );

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        회원 정보
      </Typography>

      <MemberInfoFilter
        onReset={handleReset}
        onSearch={handleSearch}
      />
      <button
        onClick={() => {
          navigateToScreen("emsp-member-info-detail", { pathParams: { id: "123" } });
        }}
      >
        asdasdasd
      </button>

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
