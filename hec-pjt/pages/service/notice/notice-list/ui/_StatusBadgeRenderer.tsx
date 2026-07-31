import { Badge, TextBadge, Typography } from '@hae-fe/elements';
import type { ICellRendererParams } from 'ag-grid-community';

import { BADGE_PROPS } from '@/features/notice-form/model/constant';

type StatusBadgeRendererParams<T extends object> = ICellRendererParams<T> & {
  mode?: 'badge' | 'text' | 'textBadge';
  textField?: keyof T;
  badgeField?: keyof T;
  badgeText?: string;
  labelMap?: Record<string, string>;
};

export const StatusBadgeRenderer = <TData extends object>(params: StatusBadgeRendererParams<TData>) => {
  const mode = params.mode ?? 'badge';
  const status = params.badgeField && params.data ? params.data[params.badgeField] : params.value;
  const text = params.textField && params.data ? String(params.data[params.textField] ?? '-') : '-';
  const badge = BADGE_PROPS[String(params.value) as keyof typeof BADGE_PROPS];
  const hasBadge = Boolean(status);
  const badgeText =
    params.labelMap?.[String(status)] ?? badge?.badgeContent ?? params.badgeText ?? String(status ?? '');

  switch (mode) {
    case 'text': {
      return <Typography hdsProps={{ weight: 'regular', type: 'body', size: '15' }}>{text}</Typography>;
    }
    case 'textBadge': {
      return (
        <div className="flex items-center gap-2">
          {hasBadge && (
            <TextBadge
              size="small"
              expressive
              // styleOption={fill}
              badgeContent={badgeText}
            />
          )}
          <Typography hdsProps={{ weight: 'regular', type: 'body', size: '15' }}>{text}</Typography>
        </div>
      );
    }
    case 'badge': {
      return (
        <Badge
          type="text"
          semantic={badge?.semantic ?? 'neutral'}
          size="small"
          styleOption="fill-pastel"
          badgeContent={badge?.badgeContent ?? '-'}
        />
      );
    }
    // No default
  }
};
