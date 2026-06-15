import { Suspense } from "react";
import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { useRoutes } from "react-router-dom";
import { AppSidebar, APP_SIDEBAR_WIDTH } from "@/app/layouts/app-sidebar";
import { useInitializeMenuPermission } from "@/entities/user";
import routes from "~react-pages";

const App = () => {
  useInitializeMenuPermission();

  return (
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
        <Toolbar>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            운영 관리
          </Typography>
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
        <Suspense fallback={null}>{useRoutes(routes)}</Suspense>
      </Box>
    </Box>
  );
};

export default App;
