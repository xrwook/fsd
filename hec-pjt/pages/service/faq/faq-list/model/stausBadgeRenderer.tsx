import { Badge, TextBadge, Typography } from "@hae-fe/elements";
import { type ICellRendererParams } from "ag-grid-community";

import { FAQ_BADGE_PROPS } from "@/features/faq-form/model/constant";

type StausBadgeRendererParams<T extends object> = ICellRendererParams<T> & {
  badgeField?: keyof T;
  textField?: keyof T;
  labelMap?: Record<string, string>;
  mode?: "badge" | "text" | "textBadge";
  badgeText?: string;
};

export const StausBadgeRenderer = <TData extends object>(
  params: StausBadgeRendererParams<TData>,
) => {
  const mode = params.mode ?? "badge";
  const status =
    params.badgeField && params.data
      ? params.data[params.badgeField]
      : params.value;
  const text =
    params.textField && params.data
      ? String(params.data[params.textField] ?? "-")
      : "-";
  const badge =
    FAQ_BADGE_PROPS[String(params.value) as keyof typeof FAQ_BADGE_PROPS];
  const hasBadge = Boolean(status);
  const badgeText =
    params.labelMap?.[String(status)] ??
    badge?.badgeContent ??
    params.badgeText ??
    String(status ?? "");

  switch (mode) {
    case "text": {
      return (
        <Typography hdsProps={{ weight: "regular", type: "body", size: "15" }}>
          {text}
        </Typography>
      );
    }
    case "textBadge": {
      return (
        <div className="flex items-center gap-2">
          {hasBadge && (
            <TextBadge size="small" expressive badgeContent={badgeText} />
          )}
          <Typography
            hdsProps={{ weight: "regular", type: "body", size: "15" }}
          >
            {text}
          </Typography>
        </div>
      );
    }
    case "badge": {
      return (
        <Badge
          type="text"
          semantic={badge?.semantic ?? "neutral"}
          size="small"
          styleOption={badge?.styleOption ?? "fill-pastel"}
          badgeContent={badge?.badgeContent ?? "-"}
        />
      );
    }
  }
};
