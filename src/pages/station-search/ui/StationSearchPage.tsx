import { useState } from "react";
import {
  Container as MapDiv,
  NaverMap,
  type NaverMapProps as BaseMapProps,
} from "react-naver-maps";

import { MapMarker, RegionCountMarker } from "@/shared/ui/map";

import { stationList } from "../mock/station-search";

const DEFAULT_CENTER = { lat: 37.5774, lng: 126.9875 };

import {
  DEFAULT_ZOOM,
  getMarkerDisplay,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../config/zoom";
import MapControl from "./_MapControl";
import SearchField from "./_SearchField";

interface MapProps extends BaseMapProps {
  height?: number;
}

const SELF_BRAND_CPO_ID = "HY";

export const isSelfBrandCpo = (cpoId: string): boolean =>
  cpoId === SELF_BRAND_CPO_ID;

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
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const handleZoom = (newValue: number) => setZoom(newValue);
  const isRegionView = getMarkerDisplay(zoom) < 3;
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
          {isRegionView ? (
            stationList.map((station) => (
              <MapMarker
                available={1}
                cpoName={station.cpoName}
                display={getMarkerDisplay(zoom)}
                isSelected={selectedStationId === station.locationId}
                key={station.locationId}
                position={{ lat: station.latitude, lng: station.longitude }}
                stationType={isSelfBrandCpo(station.cpoId) ? "epit" : "roaming"}
                status={station.locationStatus}
                total={5}
                onClick={() => alert(station.csId)}
              />
            ))
          ) : (
            // 줌레벨 3이경우, 로밍은 클러스터로, epit은 epit(MapMarker)로 심볼이 노출되어야합니다.
            <RegionCountMarker
              count={10}
              position={{ lat: 37.508_87, lng: 127.063_19 }}
            />
          )}
        </NaverMap>
      </MapDiv>
    </div>
  );
};

export default StationSearchPage;
