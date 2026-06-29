import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Stack, Typography } from "@mui/material";

import { useListNavigation } from "@/shared/lib/router";

type TMemberInfoDetailProps = {
  params: Readonly<Record<string, string | undefined>>;
  parentPath: string;
};

const MemberInfoDetail = ({ params, parentPath }: TMemberInfoDetailProps) => {
  const { goBackToList } = useListNavigation();

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          onClick={() => goBackToList(parentPath)}
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
