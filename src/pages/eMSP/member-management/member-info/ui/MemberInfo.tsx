import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { useListNavigation, useUrlSearchParams } from "@/shared/lib/router";

import { useGetMemberListQuery } from "../api/getMemberList";

const MemberInfo = () => {
  const { goToDetail } = useListNavigation();
  const { searchParams, updateSearchParams } = useUrlSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const {
    data: members = [],
    isError,
    isFetching,
    isPending,
    refetch,
  } = useGetMemberListQuery({ keyword });

  useEffect(() => {
    setDraftKeyword(keyword);
  }, [keyword]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedKeyword = draftKeyword.trim();

    if (normalizedKeyword === keyword) {
      void refetch();
      return;
    }

    updateSearchParams({
      keyword: normalizedKeyword || null,
    });
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
          value={draftKeyword}
        />
        <Button disabled={isFetching} type="submit" variant="contained">
          {isFetching ? "조회 중" : "조회"}
        </Button>
      </Stack>

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
