import { Badge } from "@hae-fe/elements";
import type { ICellRendererParams } from "ag-grid-community";

import { BADGE_PROPS } from "@/features/term-form/model/constant";

export const TermStatusBadgeRenderer = <TData extends object>(
  params: ICellRendererParams<TData>,
) => {
  const badgeInfo =
    BADGE_PROPS[String(params.value) as keyof typeof BADGE_PROPS];

  return (
    <Badge
      type="text"
      semantic={badgeInfo?.semantic ?? "neutral"}
      size="small"
      styleOption={badgeInfo?.styleOption ?? "fill-pastel"}
      badgeContent={badgeInfo?.badgeContent ?? "-"}
    />
  );
};
