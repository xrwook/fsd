import { Box, Button, Stack, Typography } from "@mui/material";

import type { MemberSummary } from "../model/member";

type Props = {
  isError: boolean;
  isPending: boolean;
  members: MemberSummary[];
  onOpenDetail: (memberId: string) => void;
  onRetry: () => void;
};

export const MemberInfoTable = ({
  isError,
  isPending,
  members,
  onOpenDetail,
  onRetry,
}: Props) => {
  return (
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
          <Typography color="error">회원 정보 조회에 실패했습니다.</Typography>
          <Button onClick={onRetry} sx={{ ml: "auto" }}>
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
              onClick={() => onOpenDetail(member.id)}
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
  );
};
