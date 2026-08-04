import { useParams } from "react-router-dom";

import { SCREEN_ID } from "@/shared/config";
import { navigateToScreen } from "@/shared/lib/navigation/navigation";
import { PageLayout } from "@/widgets/layout/ui";

import { useGetTermDetailQuery } from "../api";
import { TermsDetailBasicInfo } from "./_TermsDetailBasicInfo";
import { TermsDetailDeploySettings } from "./_TermsDetailDeploySettings";

const TermsDetailPage = () => {
  const { id = "" } = useParams();
  const { data: detail } = useGetTermDetailQuery(
    {
      path: {
        id,
      },
    },
    !!id,
  );

  const canUpdate = detail?.deployStatus === "R";

  return (
    <PageLayout
      title={`${detail?.termCode ?? "약관"} 상세`}
      headerButtonItems={[
        {
          label: "목록",
          variant: "ghost",
          onClick: () =>
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS),
        },
        {
          label: "수정",
          variant: "primary",
          disabled: !canUpdate,
          onClick: () =>
            navigateToScreen(SCREEN_ID.PLATFORMMGT.PFMT_POLICY_TERMS_UPDATE, {
              pathParams: {
                id,
              },
            }),
        },
      ]}
    >
      <TermsDetailBasicInfo data={detail} />
      <TermsDetailDeploySettings data={detail} />
    </PageLayout>
  );
};

export default TermsDetailPage;
