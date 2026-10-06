import type { ReactNode } from "react";
import { CustomOverlay } from "react-naver-maps";

import { LOGO_Epit, LOGO_Symbol_Epit } from "@/shared/assets/logo";
import { cn } from "@/shared/lib/tailwind";
import { getMapMarkerConfig } from "@/shared/ui/map/lib";

import type { MarkerStatus, StationType } from "./";

interface MapMarkerProps {
  available?: number;
  total?: number;
  cpoName?: string;
  isSelected?: boolean;
  position: { lat: number; lng: number };
  status?: MarkerStatus;
  stationType?: StationType;
  onClick?: () => void;
  display: number;
}

// TODO: 줌레벨 level에 따라 epit 아이콘변경
const STATION_PREFIX: Record<StationType, ReactNode> = {
  epit: <LOGO_Epit className="h-3.5 w-auto" />,
  roaming: <span className="typo-caption-12-semibold">로밍</span>,
  general: "",
};

const EPIT_ICON: Record<number, ReactNode> = {
  1: <LOGO_Epit className="h-3.5 w-auto" />,
  2: <LOGO_Epit className="h-3.5 w-auto" />,
  3: <LOGO_Symbol_Epit className="h-3.5 w-auto" />,
};

const getStationPrefix = (type: StationType, display: number) => {
  return type === "epit" ? EPIT_ICON[display] : STATION_PREFIX[type];
};

export const MapMarker = ({
  available = 0,
  total = 0,
  cpoName,
  isSelected = false,
  onClick: handleClick,
  position,
  status = "AVAILABLE",
  stationType = "general",
  display,
}: MapMarkerProps) => {
  // const config = status === 'available' ? AVAILABLE_MARKER_STYLE_CONFIG[stationType] : MARKER_STYLE_CONFIG[status];
  const config = getMapMarkerConfig(status, stationType);

  const { bodyClass, pointerClass, hasTimeSaleBanner, dividerClass } = config;
  const prefix = STATION_PREFIX[stationType];
  const bodyText = total > 0 ? `${available}/${total}` : "-";

  return (
    <CustomOverlay position={position} zIndex={isSelected ? 200 : 100}>
      <button
        className={cn(
          "flex origin-[0_50%] cursor-pointer flex-col items-center border-0 bg-transparent p-0 transition-transform",
          { "scale-120": isSelected },
        )}
        style={{ transform: "translate(-50%, -100%)" }}
        type="button"
        onClick={handleClick}
      >
        <div className="flex flex-col items-center whitespace-nowrap">
          {hasTimeSaleBanner && display === 1 && (
            <div className="bg-poi-surface-badge z-1 relative -mb-0.5 flex h-3.5 items-center justify-center rounded-sm px-1">
              <span
                className={cn(
                  "text-text-inverse-strongest text-[8px] leading-px font-bold",
                )}
              >
                무료주차
              </span>
            </div>
          )}
          <div
            className={cn(
              "inline-flex h-6 items-center justify-center gap-1.5 rounded-lg border-[1.5px] py-0.5 text-xs font-semibold",
              bodyClass,
              {
                "px-2.5": display === 1 || display === 2, // display1, display2일경우
                "px-2.25": display === 3, // display3일경우
              },
              {
                "border-poi-border-enabled shadow-[0_2px_0_0_rgba(0,0,0,0.06)]":
                  !isSelected,
                "border-poi-border-selected shadow-[0_2.4px_4.8px_0_rgba(0,0,0,0.06)]":
                  isSelected,
              },
            )}
          >
            {getStationPrefix(stationType, display)}
            {display === 1 && (
              <>
                {!!prefix && (
                  <span className={cn("block h-2.5 w-px", dividerClass)} />
                )}
                {bodyText}
              </>
            )}
            {display === 2 && stationType === "roaming" && (
              <>
                {cpoName && (
                  <span className={cn("block h-2.5 w-px", dividerClass)} />
                )}
                {cpoName}
              </>
            )}
          </div>
          <div
            className={cn(
              "relative z-1 h-1.25 w-3.25 -translate-y-[1.5px] after:absolute after:-top-px after:right-0 after:left-0 after:-z-2 after:h-0.5 after:-translate-y-[60%] after:bg-current after:content-['']",
              pointerClass,
            )}
          >
            <svg
              fill="none"
              height="5"
              viewBox="0 0 13 5"
              width="13"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 0V1H12C10.74 1 9.55 1.59 8.79 2.59L7.22 4.65C6.86 5.12 6.14 5.12 5.78 4.65L4.21 2.59C3.45 1.59 2.26 1 1 1H0V0H13Z"
                fill="currentColor"
              />
              <path
                d="M13 0.5H12C10.59 0.5 9.24 1.17 8.39 2.29L6.82 4.35C6.74 4.45 6.63 4.51 6.5 4.51C6.37 4.51 6.25 4.45 6.18 4.35L4.61 2.29C3.76 1.17 2.41 0.5 1 0.5H0"
                stroke="black"
                strokeMiterlimit="10"
                strokeOpacity={isSelected ? "0.30" : "0.16"}
              />
            </svg>
          </div>
        </div>
      </button>
    </CustomOverlay>
  );
};
