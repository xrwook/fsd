import { useState } from "react";
import {
  Container as MapDiv,
  NaverMap,
  type NaverMapProps as BaseMapProps,
} from "react-naver-maps";

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
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearch, setIsSearch] = useState(false);

  const handleSearchValue = (newValue: string) => {
    setSearchValue(newValue);
  };

  const handleSubmitValue = (newValue: string) => {
    setSearchValue(newValue);
    setIsSearch(false);
  };

  const handleSearch = (newValue: boolean) => {
    setIsSearch(newValue);
  };

  const selectedStationId = "1";
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const handleZoom = (newValue: number) => setZoom(newValue);
  const mapLevel = getMapLevel(zoom);
  const markerDisplay = getMarkerDisplay(mapLevel);
  const clusterLevel = getClusterLevel(mapLevel);
  const [map, setMap] = useState<naver.maps.Map | null>(null);

  return (
    <div className="fixed inset-0">
      <SearchField
        isSearch={isSearch}
        searchValue={searchValue}
        onChange={handleSearchValue}
        onClear={() => handleSearchValue("")}
        onSearch={handleSearch}
        onSubmit={handleSubmitValue}
      />

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
              onClick={(locationId) => alert(locationId)}
            />
          )}
        </NaverMap>
      </MapDiv>
    </div>
  );
};

export default StationSearchPage;
