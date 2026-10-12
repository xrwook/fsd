import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect, useMemo, useRef } from "react";

import { useModal } from "@/shared/lib/modal";
import { StationDetail, StationDetailModal } from "@/widgets/station-sheet";

import {
  type LocationDetailRequest,
  useGetLocationDetailQuery,
} from "../api/location-detail";

interface Props {
  locationId: string;
  center: { lat: number; lng: number };
  onClose: () => void;
}

const StationDetailWrap = ({ locationId, center, onClose }: Props) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { open } = useModal();
  const isModalOpenedRef = useRef(false);

  const request = useMemo<LocationDetailRequest>(
    () => ({
      path: { locationId },
      requestBody: {
        latitude: center.lat,
        longitude: center.lng,
      },
    }),
    [center.lat, center.lng, locationId],
  );

  const { data: detail } = useGetLocationDetailQuery(request);
  const station = detail?.data;

  useEffect(() => {
    if (!isMobile) {
      isModalOpenedRef.current = false;
      return;
    }

    if (!station || isModalOpenedRef.current) return;

    isModalOpenedRef.current = true;
    open(StationDetailModal, { station, onClose });
  }, [isMobile, onClose, open, station]);

  if (!station) return null;
  if (isMobile) return null;

  return (
    <div className="absolute top-20 left-10 z-20 flex h-[80vh] max-h-156 w-86 flex-col overflow-hidden rounded-2xl bg-[#F5F7FA] shadow-[0_6px_14px_0_rgba(0,0,0,0.12)] xl:top-28 xl:left-16">
      <StationDetail station={station} onClose={onClose} />
    </div>
  );
};

export default StationDetailWrap;
