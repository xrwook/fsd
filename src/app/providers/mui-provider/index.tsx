import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import type { PropsWithChildren } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    text: {
      primary: "#172033",
      secondary: "#667085",
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily:
      '"Inter", "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

type Props = PropsWithChildren;

export const MuiProvider = ({ children }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
