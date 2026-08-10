import { Badge } from "@hae-fe/elements";
import type { ICellRendererParams } from "ag-grid-community";

import type {
  PartnershipListItem,
  PartnershipProcessStatusCd,
} from "../model/partnershipList";

const STATUS_BADGE_PROPS: Record<
  PartnershipProcessStatusCd,
  {
    badgeContent: string;
    semantic: "brand" | "neutral" | "positive";
    styleOption: "fill-pastel";
  }
> = {
  PENDING: {
    badgeContent: "대기",
    semantic: "neutral",
    styleOption: "fill-pastel",
  },
  CONFIRMED: {
    badgeContent: "확인 완료",
    semantic: "positive",
    styleOption: "fill-pastel",
  },
};

export const PartnershipStatusBadgeRenderer = (
  params: ICellRendererParams<PartnershipListItem, PartnershipProcessStatusCd>,
) => {
  const status = params.value;
  const badge = status ? STATUS_BADGE_PROPS[status] : undefined;

  return (
    <Badge
      type="text"
      semantic={badge?.semantic ?? "neutral"}
      size="small"
      styleOption={badge?.styleOption ?? "fill-pastel"}
      badgeContent={
        params.data?.processStatusName ?? badge?.badgeContent ?? "-"
      }
    />
  );
};
