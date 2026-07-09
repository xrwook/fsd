import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useSyncExternalStore } from "react";

import {
  closeApiErrorModal,
  getApiErrorModalState,
  subscribeApiErrorModal,
} from "@/shared/lib/api/apiErrorModalStore";

export const ApiErrorModal = () => {
  const { current, queue } = useSyncExternalStore(
    subscribeApiErrorModal,
    getApiErrorModalState,
    getApiErrorModalState,
  );

  const hasMeta = Boolean(current?.status || current?.code || current?.trace);

  return (
    <Dialog fullWidth maxWidth="xs" open={Boolean(current)} role="alertdialog">
      <DialogTitle>{current?.title ?? "오류가 발생했습니다."}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="error" variant="outlined">
            {current?.message ?? "요청 처리 중 오류가 발생했습니다."}
          </Alert>

          {hasMeta && (
            <Box
              sx={{
                bgcolor: "grey.50",
                border: 1,
                borderColor: "grey.200",
                borderRadius: 1,
                p: 1.5,
              }}
            >
              {current?.status && (
                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                  HTTP Status: {current.status}
                </Typography>
              )}
              {current?.code && (
                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                  Code: {current.code}
                </Typography>
              )}
              {current?.trace && (
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: 12,
                    overflowWrap: "anywhere",
                  }}
                >
                  Trace: {current.trace}
                </Typography>
              )}
            </Box>
          )}

          {queue.length > 0 && (
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              추가 오류 {queue.length}건이 대기 중입니다.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={closeApiErrorModal}>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};
