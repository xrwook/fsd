import type { CSSProperties } from "react";

import type {
  ChargingStationDetail,
  StationParkingType,
} from "@/entities/charging-station";
import { isSelfBrandCpo } from "@/entities/charging-station";
import { CloseIcon } from "@/shared/assets/icons";
import { LOGO_Epit } from "@/shared/assets/logo";
import { cn } from "@/shared/lib/tailwind";
import { AppBadge } from "@/shared/ui/badge";
import { Divider } from "@/shared/ui/divider";

const PARKING_TYPE_LABEL: Record<StationParkingType, string> = {
  FREE: "무료주차",
  PUBLIC: "공영주차",
  GOVERNMENT: "공공기관",
  OPTIONAL_FREE: "조건부 무료",
};

interface Props {
  station: ChargingStationDetail;
  scrollStyle?: {
    title?: CSSProperties;
    show?: CSSProperties;
  };
  onClose: () => void;
}

export const StationDetailHeader = ({
  station,
  scrollStyle,
  onClose: handleClose,
}: Props) => {
  const isSelfBrand = isSelfBrandCpo(station.cpoId);

  return (
    <>
      <div className="relative px-6 pt-4 md:pt-6">
        <div className="grid grid-cols-[1fr_auto] items-start gap-1">
          <div className="col-start-1 col-end-2 flex flex-wrap items-center gap-1.5">
            {isSelfBrand ? (
              <AppBadge
                className="bg-surface-primary-strong border-border-neutral-weakest"
                label={<LOGO_Epit className="h-2.5 w-auto text-[#6F8FA]" />}
                type="epit"
                variant="primary"
              />
            ) : (
              <AppBadge
                label={station.cpoName}
                type="roaming"
                variant="primary"
              />
            )}
            {station.publicOpenYn && (
              <AppBadge label="개방" type="badge" variant="gray" />
            )}
            <AppBadge
              label={PARKING_TYPE_LABEL[station.parkingType]}
              type="badge"
              variant="gray"
            />
            {station.qrScanYn && (
              <AppBadge label="QR가능" type="badge" variant="gray" />
            )}
            {station.pncYn && (
              <AppBadge label="PnC" type="badge" variant="gray" />
            )}
          </div>
          <div className="col-start-2 col-end-3 flex items-center gap-3">
            <button
              aria-label="닫기"
              className="text-icon-neutral-weak icon-size-md"
              type="button"
              onClick={handleClose}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="mt-2">
          <p
            className={cn("text-text-neutral-stronger text-xl font-semibold")}
            style={scrollStyle?.title}
          >
            {station.name}
          </p>
        </div>
      </div>
      <div className="mt-2 opacity-0" style={scrollStyle?.show}>
        <Divider />
      </div>
    </>
  );
};
