import CloseIcon from "@mui/icons-material/Close";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { isSelfBrandCpo } from "@/entities/charging-station";
import { LOGO_Epit } from "@/shared/assets/logo";

interface Props {
  station: ChargingStationDetail;
  onClose: () => void;
}

const PARKING_TYPE_LABEL: Record<string, string> = {
  FREE: "무료주차",
  PUBLIC: "공영주차",
  GOVERNMENT: "공공기관",
  OPTIONAL_FREE: "조건부 무료",
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-background-coolgray-weakest text-text-neutral-weaker inline-flex h-6 items-center rounded-md px-2 text-xs font-medium">
    {children}
  </span>
);

const StationDetailHeader = ({ station, onClose: handleClose }: Props) => {
  const isSelfBrand = isSelfBrandCpo(station.cpoId);
  const parkingLabel =
    PARKING_TYPE_LABEL[station.parkingType] ?? station.parkingType;

  return (
    <header className="bg-background-white px-6 pt-6 pb-4">
      <div className="grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {isSelfBrand ? (
            <span className="bg-surface-primary-strong inline-flex h-6 items-center rounded-md px-2 text-white">
              <LOGO_Epit className="h-3 w-auto" />
            </span>
          ) : (
            <Badge>{station.cpoName}</Badge>
          )}
          {station.publicOpenYn && <Badge>개방</Badge>}
          <Badge>{parkingLabel}</Badge>
          {station.qrScanYn && <Badge>QR가능</Badge>}
          {station.pncYn && <Badge>PnC</Badge>}
        </div>

        <button
          aria-label="닫기"
          className="text-icon-neutral-weak flex size-8 items-center justify-center"
          type="button"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <h2 className="text-text-neutral-stronger mt-3 text-xl font-semibold">
        {station.name}
      </h2>
    </header>
  );
};

export default StationDetailHeader;
