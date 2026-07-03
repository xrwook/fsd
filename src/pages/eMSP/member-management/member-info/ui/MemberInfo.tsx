import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { useListNavigation, useUrlSearchParams } from "@/shared/lib/router";

import { useGetMemberListQuery } from "../api/getMemberList";
import {
  isMemberStatus,
  MEMBER_STATUSES,
  type TMemberStatus,
} from "../model/member";

const parseMemberStatus = (value: string | null): TMemberStatus | "" => {
  return value && isMemberStatus(value) ? value : "";
};

const MemberInfo = () => {
  const { goToDetail } = useListNavigation();
  const { clearSearchParams, searchParams, updateSearchParams } =
    useUrlSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const status = parseMemberStatus(searchParams.get("status"));
  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const [draftStatus, setDraftStatus] = useState<TMemberStatus | "">(status);
  const {
    data: members = [],
    isError,
    isFetching,
    isPending,
    refetch,
  } = useGetMemberListQuery({ keyword, status });

  useEffect(() => {
    setDraftKeyword(keyword);
    setDraftStatus(status);
  }, [keyword, status]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedKeyword = draftKeyword.trim();

    if (normalizedKeyword === keyword && draftStatus === status) {
      void refetch();
      return;
    }

    updateSearchParams({
      keyword: normalizedKeyword || null,
      status: draftStatus || null,
    });
  };

  const handleReset = () => {
    setDraftKeyword("");
    setDraftStatus("");
    clearSearchParams();
  };

  const handleOpenDetail = (memberId: string) => {
    goToDetail(memberId);
  };

  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h5">
        회원 정보
      </Typography>

      <Stack
        component="form"
        direction={{ xs: "column", sm: "row" }}
        onSubmit={handleSearch}
        spacing={1}
      >
        <TextField
          label="회원명"
          onChange={(event) => setDraftKeyword(event.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
          value={draftKeyword}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="member-status-label">회원 상태</InputLabel>
          <Select
            label="회원 상태"
            labelId="member-status-label"
            onChange={(event) =>
              setDraftStatus(event.target.value as TMemberStatus | "")
            }
            value={draftStatus}
          >
            <MenuItem value="">전체</MenuItem>
            {MEMBER_STATUSES.map((memberStatus) => (
              <MenuItem key={memberStatus} value={memberStatus}>
                {memberStatus}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button disabled={isFetching} type="submit" variant="contained">
          {isFetching ? "조회 중" : "조회"}
        </Button>
        <Button onClick={handleReset} type="button" variant="outlined">
          초기화
        </Button>
      </Stack>

      <Typography color="text.secondary" variant="body2">
        현재 검색 조건: 회원명 {keyword || "전체"} / 회원 상태{" "}
        {status || "전체"}
      </Typography>

      <Stack
        divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}
        sx={{ borderBlock: 1, borderColor: "divider" }}
      >
        {isPending && (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            회원 정보를 조회하고 있습니다.
          </Typography>
        )}

        {isError && (
          <Stack direction="row" sx={{ alignItems: "center", py: 2 }}>
            <Typography color="error">
              회원 정보 조회에 실패했습니다.
            </Typography>
            <Button onClick={() => void refetch()} sx={{ ml: "auto" }}>
              다시 시도
            </Button>
          </Stack>
        )}

        {!isPending &&
          !isError &&
          members.map((member) => (
            <Stack
              direction="row"
              key={member.id}
              sx={{ alignItems: "center", minHeight: 56, py: 1 }}
            >
              <Button
                onClick={() => handleOpenDetail(member.id)}
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
                type="button"
              >
                {member.name}
              </Button>
              <Typography color="text.secondary" sx={{ ml: "auto" }}>
                {member.status}
              </Typography>
            </Stack>
          ))}

        {!isPending && !isError && members.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            조회 결과가 없습니다.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default MemberInfo;
