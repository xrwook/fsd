import { Box, Button, Stack, Typography } from "@mui/material";
import { useMemo } from "react";

import {
  AgGrid,
  type ColDef,
  type GridOptions,
} from "@/shared/ui/ag-grid";

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
  const columnDefs = useMemo<ColDef<MemberSummary>[]>(
    () => [
      {
        field: "name",
        flex: 1.5,
        headerName: "회원명",
        minWidth: 180,
      },
      {
        field: "status",
        headerName: "상태",
        maxWidth: 140,
        minWidth: 120,
      },
    ],
    [],
  );
  const gridProps = useMemo<GridOptions<MemberSummary>>(
    () => ({
      columnDefs,
      getRowId: ({ data }) => data.id,
      loading: isPending,
      onRowClicked: ({ data }) => {
        if (!data) {
          return;
        }

        onOpenDetail(data.id);
      },
      rowData: members,
    }),
    [columnDefs, isPending, members, onOpenDetail],
  );

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

  return (
    <Box>
      <AgGrid<MemberSummary>
        gridProps={gridProps}
        height={360}
      />
    </Box>
  );
};
