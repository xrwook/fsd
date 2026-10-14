import { useState } from "react";
import {
  Container as MapDiv,
  NaverMap,
  type NaverMapProps as BaseMapProps,
} from "react-naver-maps";

import type { LocationItem } from "../api/locations";
import {
  DEFAULT_ZOOM,
  getClusterLevel,
  getMapLevel,
  getMarkerDisplay,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../config/zoom";
import ClusterMarkers from "./_ClusterMarkers";
import MapControl from "./_MapControl";
import SearchField from "./_SearchField";
import StationDetailWrap from "./_StationDetailWrap";
import StationMarkers from "./_StationMarkers";

const DEFAULT_CENTER = { lat: 37.5774, lng: 126.9875 };

interface MapProps extends Omit<BaseMapProps, "defaultCenter"> {
  defaultCenter?: { lat: number; lng: number };
  height?: number;
}

// CF-01-01 | 충전소 탐색 페이지
const StationSearchPage = ({
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  ...props
}: MapProps) => {
  const [selectedStationId, setSelectedStationId] = useState<string>();
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [zoom, setZoom] = useState<number>(defaultZoom);

  const mapLevel = getMapLevel(zoom);
  const markerDisplay = getMarkerDisplay(mapLevel);
  const clusterLevel = getClusterLevel(mapLevel);
  const currentCenter = map?.getCenter() as naver.maps.LatLng | undefined;
  const searchCenter = currentCenter
    ? { lat: currentCenter.lat(), lng: currentCenter.lng() }
    : defaultCenter;

  const handleSelectStation = (location: LocationItem) => {
    setSelectedStationId(location.locationId);
    map?.morph(
      { lat: location.latitude, lng: location.longitude },
      defaultZoom,
    );
  };

  const handleZoom = (newValue: number) => setZoom(newValue);
  const handleCloseDetail = () => setSelectedStationId(undefined);

  return (
    <div className="fixed inset-0">
      {selectedStationId ? (
        <StationDetailWrap
          center={searchCenter}
          locationId={selectedStationId}
          onClose={handleCloseDetail}
        />
      ) : (
        <SearchField center={searchCenter} onSubmit={handleSelectStation} />
      )}

      <MapDiv className="relative h-full w-full">
        <MapControl
          display={zoom}
          onZoomIn={() => map?.setZoom(zoom + 1, true)}
          onZoomOut={() => map?.setZoom(zoom - 1, true)}
        />
        <NaverMap
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          maxZoom={MAX_ZOOM}
          minZoom={MIN_ZOOM}
          ref={setMap}
          {...props}
          onZoomChanged={handleZoom}
        >
          {clusterLevel ? (
            <ClusterMarkers
              defaultCenter={defaultCenter}
              display={markerDisplay}
              level={clusterLevel}
            />
          ) : (
            <StationMarkers
              defaultCenter={defaultCenter}
              display={markerDisplay}
              selectedStationId={selectedStationId}
              onClick={handleSelectStation}
            />
          )}
        </NaverMap>
      </MapDiv>
    </div>
  );
};

export default StationSearchPage;
