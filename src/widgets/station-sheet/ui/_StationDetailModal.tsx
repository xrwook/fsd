import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect } from "react";

import type { ChargingStationDetail } from "@/entities/charging-station";
import { useModal } from "@/shared/lib/modal";
import { ExpandableBottomSheet } from "@/shared/ui/bottom-sheet";

import StationDetail from "./_StationDetail";

interface Props {
  station: ChargingStationDetail;
  onClose: () => void;
}

const StationDetailModal = ({ station, onClose }: Props) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { close } = useModal();

  const handleClose = () => {
    onClose();
    close();
  };

  useEffect(() => {
    if (!isMobile) close();
  }, [close, isMobile]);

  return (
    <ExpandableBottomSheet initialHeight={450} isShowDim={false} topInset={72}>
      <StationDetail
        className="scrollbar-hide relative max-h-full overflow-y-auto"
        station={station}
        onClose={handleClose}
      />
    </ExpandableBottomSheet>
  );
};

export default StationDetailModal;
