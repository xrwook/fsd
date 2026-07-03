import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import { useListNavigation } from "@/shared/lib/router";

type TMemberInfoDetailProps = {
  parentPath: string;
};

const MemberInfoDetail = ({ parentPath }: TMemberInfoDetailProps) => {
  const { memberId } = useParams<{ memberId: string }>();
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
          회원 ID: {memberId}
        </Typography>
      </Box>

      <Box>
        <Typography component="h2" variant="subtitle1">
          목록 검색 조건
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
          이 조건은 상세 URL의 query string에 유지되며, 브라우저 뒤로가기와 목록
          버튼에서 그대로 복원됩니다.
        </Typography>
      </Box>
    </Stack>
  );
};

export default MemberInfoDetail;
