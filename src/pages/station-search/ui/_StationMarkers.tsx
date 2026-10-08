import { useCallback, useEffect, useState } from "react";
import { useListener, useMap } from "react-naver-maps";

import { MapMarker, type MarkerStatus } from "@/shared/ui/map";

import {
  type LocationItem,
  type LocationsRequest,
  useGetLocationsQuery,
} from "../api/locations";
import type { MarkerDisplay } from "../config/zoom";

interface Props {
  defaultCenter: { lat: number; lng: number };
  display: MarkerDisplay;
  selectedStationId?: string;
  onClick?: (locationId: string) => void;
}

const SELF_BRAND_CPO_ID = "HY";

const isSelfBrandCpo = (cpoId: string): boolean => cpoId === SELF_BRAND_CPO_ID;

const getMarkerStatus = (locationStatus: string): MarkerStatus => {
  if (locationStatus === "AVAILABLE") return "AVAILABLE";
  if (locationStatus === "BUSY" || locationStatus === "FULL") return "BUSY";
  return "UNAVAILABLE";
};

const getChargerCount = (location: LocationItem) => {
  return location.chargingSpeedDivisionCount.reduce(
    (count, division) => ({
      available: count.available + division.availableCount,
      total: count.total + division.totalCount,
    }),
    { available: 0, total: 0 },
  );
};

const createDefaultRequest = (center: { lat: number; lng: number }) => ({
  query: {
    page: 0,
    size: 1000,
    sort: ["distanceMeters,ASC"],
  },
  requestBody: {
    latitude: center.lat,
    longitude: center.lng,
    maxLatitude: center.lat,
    maxLongitude: center.lng,
    minLatitude: center.lat,
    minLongitude: center.lng,
  },
});

const StationMarkers = ({
  defaultCenter,
  display,
  selectedStationId,
  onClick: handleClick,
}: Props) => {
  const map = useMap();
  const [request, setRequest] = useState<LocationsRequest>(() =>
    createDefaultRequest(defaultCenter),
  );

  const handleSyncMapViewport = useCallback(() => {
    const bounds = map.getBounds() as naver.maps.LatLngBounds;
    const center = map.getCenter() as naver.maps.LatLng;
    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    setRequest({
      query: {
        page: 0,
        size: 1000,
        sort: ["distanceMeters,ASC"],
      },
      requestBody: {
        latitude: center.lat(),
        longitude: center.lng(),
        minLatitude: southWest.lat(),
        maxLatitude: northEast.lat(),
        minLongitude: southWest.lng(),
        maxLongitude: northEast.lng(),
      },
    });
  }, [map]);

  useListener(map, "idle", handleSyncMapViewport);

  useEffect(() => {
    handleSyncMapViewport();
  }, [handleSyncMapViewport]);

  const { data: locationsResponse } = useGetLocationsQuery(request);
  const locations = locationsResponse?.data.content ?? [];

  return (
    <>
      {locations.map((location) => {
        const chargerCount = getChargerCount(location);

        return (
          <MapMarker
            available={chargerCount.available}
            cpoName={location.cpoName}
            display={display}
            isSelected={selectedStationId === location.locationId}
            key={location.locationId}
            position={{
              lat: location.latitude,
              lng: location.longitude,
            }}
            stationType={isSelfBrandCpo(location.cpoId) ? "epit" : "roaming"}
            status={getMarkerStatus(location.locationStatus)}
            total={chargerCount.total}
            onClick={() => handleClick?.(location.locationId)}
          />
        );
      })}
    </>
  );
};

export default StationMarkers;
