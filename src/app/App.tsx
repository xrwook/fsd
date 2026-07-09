import RefreshIcon from "@mui/icons-material/Refresh";
import {
  AppBar,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Duration } from "luxon";
import { Suspense, useEffect, useState } from "react";

import { APP_SIDEBAR_WIDTH, AppSidebar } from "@/app/layouts/app-sidebar";
import { AppRouter } from "@/app/router";
import {
  forceRefreshKeycloakToken,
  getKeycloakTokenExpiresInSeconds,
} from "@/shared/lib/keycloak";
import { ApiErrorModal } from "@/shared/ui/api-error-modal";

const App = () => {
  return (
    <>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: `calc(100% - ${APP_SIDEBAR_WIDTH}px)`,
            ml: `${APP_SIDEBAR_WIDTH}px`,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 700 }}>
              운영 관리
            </Typography>
            <AccessTokenStatus />
          </Toolbar>
        </AppBar>

        <AppSidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            mt: 8,
          }}
        >
          <Suspense fallback={null}>
            <AppRouter />
          </Suspense>
        </Box>
      </Box>

      <ApiErrorModal />
    </>
  );
};

const TOKEN_STATUS_INTERVAL_MS = 1000;

const formatRemainingTime = (seconds: number | null) => {
  if (seconds === null) {
    return "--:--";
  }

  return Duration.fromObject({ seconds: Math.max(0, seconds) })
    .shiftTo("minutes", "seconds")
    .toFormat("m:ss");
};

const AccessTokenStatus = () => {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() =>
    getKeycloakTokenExpiresInSeconds(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateRemainingSeconds = () => {
      setRemainingSeconds(getKeycloakTokenExpiresInSeconds());
    };

    updateRemainingSeconds();
    const intervalId = window.setInterval(
      updateRemainingSeconds,
      TOKEN_STATUS_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await forceRefreshKeycloakToken();
      setRemainingSeconds(getKeycloakTokenExpiresInSeconds());
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: "center", flexShrink: 0, minWidth: 0 }}
    >
      <Typography color="text.secondary" sx={{ fontSize: 12 }}>
        Access Token {formatRemainingTime(remainingSeconds)}
      </Typography>
      <Tooltip title="Access Token 갱신">
        <span>
          <IconButton
            aria-label="Access Token 갱신"
            disabled={isRefreshing || remainingSeconds === null}
            size="small"
            onClick={() => {
              handleRefresh().catch(() => {});
            }}
          >
            {isRefreshing ? (
              <CircularProgress size={18} />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
};

export default App;
