import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

type TMemberInfoDetailProps = {
  params: Readonly<Record<string, string | undefined>>;
  parentPath: string;
};

type TMemberDetailLocationState = {
  fromList?: boolean;
};

const MemberInfoDetail = ({ params, parentPath }: TMemberInfoDetailProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as TMemberDetailLocationState | null;

  const handleBackToList = () => {
    if (locationState?.fromList) {
      navigate(-1);
      return;
    }

    navigate(parentPath, { replace: true });
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          onClick={handleBackToList}
          startIcon={<ArrowBackIcon />}
          type="button"
        >
          목록
        </Button>
      </Box>
      <Box>
        <Typography component="h1" variant="h5">
          회원 상세
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          회원 ID: {params.memberId}
        </Typography>
      </Box>
    </Stack>
  );
};

export default MemberInfoDetail;
