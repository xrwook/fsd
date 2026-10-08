import { debounce } from "lodash-es";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useListener, useMap } from "react-naver-maps";

import { MapMarker, RegionCountMarker } from "@/shared/ui/map";

import {
  type LocationClustersRequest,
  useGetLocationClustersQuery,
} from "../api/location-clusters";
import type { ClusterLevel, MarkerDisplay } from "../config/zoom";

interface Props {
  defaultCenter: { lat: number; lng: number };
  display: MarkerDisplay;
  level: ClusterLevel;
}

const MARKER_QUERY_DEBOUNCE_MS = 1000;

const ClusterMarkers = ({ defaultCenter, display, level }: Props) => {
  const map = useMap();
  const [request, setRequest] = useState<LocationClustersRequest>(() => ({
    requestBody: {
      level,
      maxLatitude: defaultCenter.lat,
      maxLongitude: defaultCenter.lng,
      minLatitude: defaultCenter.lat,
      minLongitude: defaultCenter.lng,
    },
  }));

  const handleSyncMapViewport = useCallback(() => {
    const bounds = map.getBounds() as naver.maps.LatLngBounds;
    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    setRequest({
      requestBody: {
        level,
        minLatitude: southWest.lat(),
        maxLatitude: northEast.lat(),
        minLongitude: southWest.lng(),
        maxLongitude: northEast.lng(),
      },
    });
  }, [level, map]);

  const debouncedSyncMapViewport = useMemo(
    () => debounce(handleSyncMapViewport, MARKER_QUERY_DEBOUNCE_MS),
    [handleSyncMapViewport],
  );

  useListener(map, "idle", debouncedSyncMapViewport);

  useEffect(() => {
    debouncedSyncMapViewport();

    return () => {
      debouncedSyncMapViewport.cancel();
    };
  }, [debouncedSyncMapViewport]);

  const { data: locationClustersResponse } =
    useGetLocationClustersQuery(request);
  const clusters = locationClustersResponse?.data.ClusterList ?? [];
  const locationCoordinates =
    locationClustersResponse?.data.locationCoordinates ?? [];

  return (
    <>
      {clusters.map((cluster) => (
        <RegionCountMarker
          count={cluster.count}
          key={`${cluster.level}-${cluster.districtCode}-${cluster.latitude}-${cluster.longitude}`}
          position={{
            lat: cluster.latitude,
            lng: cluster.longitude,
          }}
        />
      ))}
      {locationCoordinates.map((location) => (
        <MapMarker
          display={display}
          key={location.locationId}
          position={{
            lat: location.latitude,
            lng: location.longitude,
          }}
          stationType="epit"
        />
      ))}
    </>
  );
};

export default ClusterMarkers;
