import { Badge, TextButton, Typography } from "@hae-fe/elements";
import { IconArrowRight01 } from "@hae-fe/icon-library/react";

interface SummaryListCardProps {
  title: string;
  count?: number;
  moreLink?: { label: string; onClick: () => void };
  children: React.ReactNode;
}

export function SummaryListCard({
  title,
  count,
  moreLink,
  children,
}: SummaryListCardProps) {
  return (
    <div className="border border-gray-200 p-6 pb-3">
      <div className="flex items-center justify-between border-b border-gray-100 px-0 pb-3">
        <div className="flex items-center gap-2">
          <Typography
            hdsProps={{ weight: "bold", type: "body", size: "15" }}
            className="text-(--color-text-neutral-strongest)"
          >
            {title}
          </Typography>
          {count !== undefined && (
            <Badge
              type="number"
              semantic="brand"
              size="small"
              badgeContent={count}
            />
          )}
        </div>
        {moreLink && (
          <TextButton
            semantic="neutral"
            size="medium"
            iconRight={<IconArrowRight01 size={20} type="outline" />}
            onClick={moreLink.onClick}
          >
            {moreLink.label}
          </TextButton>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
