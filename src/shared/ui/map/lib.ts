import type { MarkerStatus, StationType } from "./";

const STATION_STYLE = {
  epit: {
    bodyClass: "bg-poi-surface-epit text-text-inverse-strongest",
    dividerClass: "bg-border-inverse-strong",
    pointerClass: "text-poi-surface-epit",
  },
  general: {
    bodyClass: "bg-poi-surface-general text-text-neutral-stronger",
    dividerClass: "bg-border-neutral-weak",
    pointerClass: "text-poi-surface-general",
  },
  roaming: {
    bodyClass: "bg-poi-surface-roaming text-text-neutral-stronger",
    dividerClass: "bg-border-neutral-weak",
    pointerClass: "text-poi-surface-roaming",
  },
} satisfies Record<
  StationType,
  { bodyClass: string; dividerClass: string; pointerClass: string }
>;

export const getMapMarkerConfig = (
  status: MarkerStatus,
  stationType: StationType,
) => {
  const style = STATION_STYLE[stationType];

  if (status === "AVAILABLE") {
    return {
      ...style,
      hasTimeSaleBanner: stationType === "epit",
    };
  }

  return {
    bodyClass: "bg-poi-surface-disabled text-text-neutral-weaker",
    dividerClass: "bg-border-neutral-weak",
    hasTimeSaleBanner: false,
    pointerClass: "text-poi-surface-disabled",
  };
};
