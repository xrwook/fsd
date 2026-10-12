import { useEffect } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { useBreakpoint } from "@/shared/lib/breakpoint";
import { useModal } from "@/shared/lib/modal";
import { ExpandableBottomSheet } from "@/shared/ui/bottom-sheet";

import { StationDetail } from "./_StationDetail";

interface Props {
  station: ChargingStationDetail;
  onClose: () => void;
  onRefresh: () => Promise<ChargingStationDetail | undefined>;
}

const StationDetailModal = ({ station, onClose, onRefresh }: Props) => {
  const { close } = useModal();
  const breakPoint = useBreakpoint();

  const handleClose = () => {
    onClose?.();
    close();
  };

  useEffect(() => {
    if (breakPoint !== "mobile") close();
  }, [breakPoint, close]);

  return (
    <ExpandableBottomSheet initialHeight={450} isShowDim={false} topInset={72}>
      <StationDetail
        className="scrollbar-hide relative max-h-full overflow-y-auto"
        station={station}
        onClose={handleClose}
        onRefresh={onRefresh}
      />
    </ExpandableBottomSheet>
  );
};

export default StationDetailModal;
