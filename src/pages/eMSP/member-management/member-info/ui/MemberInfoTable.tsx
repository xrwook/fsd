import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

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
  if (isError) {
    return (
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          borderBlock: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <Typography color="error">회원 정보 조회에 실패했습니다.</Typography>
        <Button onClick={onRetry} sx={{ ml: "auto" }}>
          다시 시도
        </Button>
      </Stack>
    );
  }

  if (isPending) {
    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          borderBlock: 1,
          borderColor: "divider",
          py: 2,
        }}
      >
        <CircularProgress size={18} />
        <Typography>회원 정보를 조회하고 있습니다.</Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>회원명</TableCell>
              <TableCell width={140}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    조회 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow
                  hover
                  key={member.id}
                  onClick={() => onOpenDetail(member.id)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.status}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
