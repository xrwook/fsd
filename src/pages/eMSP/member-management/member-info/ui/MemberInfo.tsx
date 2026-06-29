import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const MEMBERS = [
  { id: "1001", name: "김현대", status: "이용 중" },
  { id: "1002", name: "이모빌리티", status: "휴면" },
  { id: "1003", name: "박충전", status: "이용 중" },
];

type TMemberDetailLocationState = {
  fromList?: boolean;
};

const MemberInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const [draftKeyword, setDraftKeyword] = useState(keyword);

  useEffect(() => {
    setDraftKeyword(keyword);
  }, [keyword]);

  const filteredMembers = MEMBERS.filter((member) => {
    return member.name.toLowerCase().includes(keyword.toLowerCase());
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSearchParams = new URLSearchParams(searchParams);
    const normalizedKeyword = draftKeyword.trim();

    if (normalizedKeyword) {
      nextSearchParams.set("keyword", normalizedKeyword);
    } else {
      nextSearchParams.delete("keyword");
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleOpenDetail = (memberId: string) => {
    const listPath = location.pathname.replace(/\/+$/, "");

    navigate(`${listPath}/${memberId}`, {
      state: { fromList: true } satisfies TMemberDetailLocationState,
    });
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
        <Button type="submit" variant="contained">
          조회
        </Button>
      </Stack>

      <Stack
        divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}
        sx={{ borderBlock: 1, borderColor: "divider" }}
      >
        {filteredMembers.map((member) => (
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

        {filteredMembers.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            조회 결과가 없습니다.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default MemberInfo;
