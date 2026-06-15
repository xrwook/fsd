import { Box, Drawer } from "@mui/material";
import { Sidebar } from "@/widgets/sidebar";

export const APP_SIDEBAR_WIDTH = 272;

export const AppSidebar = () => {
  return (
    <Box component="aside" sx={{ width: APP_SIDEBAR_WIDTH, flexShrink: 0 }}>
      <Drawer
        open
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            width: APP_SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRightColor: "divider",
          },
        }}
      >
        <Sidebar />
      </Drawer>
    </Box>
  );
};
