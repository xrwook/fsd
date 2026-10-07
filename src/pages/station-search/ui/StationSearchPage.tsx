import { useCallback, useEffect, useState } from "react";
import {
  Container as MapDiv,
  NaverMap,
  type NaverMapProps as BaseMapProps,
} from "react-naver-maps";

import { MapMarker, RegionCountMarker } from "@/shared/ui/map";

import {
  type LocationClustersRequest,
  useGetLocationClustersQuery,
} from "../api/location-clusters";
import {
  DEFAULT_ZOOM,
  getClusterLevel,
  getMarkerDisplay,
  MAX_ZOOM,
  MIN_ZOOM,
} from "../config/zoom";
import { stationList } from "../mock/station-search";
import MapControl from "./_MapControl";
import SearchField from "./_SearchField";

const DEFAULT_CENTER = { lat: 37.5774, lng: 126.9875 };

interface MapProps extends Omit<BaseMapProps, "defaultCenter"> {
  defaultCenter?: { lat: number; lng: number };
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
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const handleZoom = (newValue: number) => setZoom(newValue);
  const isRegionView = getMarkerDisplay(zoom) < 3;
  const [map, setMap] = useState<naver.maps.Map | null>(null);
  const [clusterRequest, setClusterRequest] = useState<LocationClustersRequest>(
    {
      requestBody: {
        level: getClusterLevel(defaultZoom),
        maxLatitude: defaultCenter.lat,
        maxLongitude: defaultCenter.lng,
        minLatitude: defaultCenter.lat,
        minLongitude: defaultCenter.lng,
      },
    },
  );

  const handleSyncMapViewport = useCallback(() => {
    if (!map) return;

    const currentZoom = map.getZoom();
    const bounds = map.getBounds() as naver.maps.LatLngBounds;
    const southWest = bounds.getSW();
    const northEast = bounds.getNE();

    setZoom(currentZoom);
    setClusterRequest({
      requestBody: {
        level: getClusterLevel(currentZoom),
        minLatitude: southWest.lat(),
        maxLatitude: northEast.lat(),
        minLongitude: southWest.lng(),
        maxLongitude: northEast.lng(),
      },
    });
  }, [map]);

  useEffect(() => {
    handleSyncMapViewport();
  }, [handleSyncMapViewport]);

  const { data: locationClustersResponse } =
    useGetLocationClustersQuery(clusterRequest);
  const clusters = locationClustersResponse?.data.ClusterList ?? [];
  const locationCoordinates =
    locationClustersResponse?.data.locationCoordinates ?? [];

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
          onIdle={handleSyncMapViewport}
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
                  display={getMarkerDisplay(zoom)}
                  key={location.locationId}
                  position={{
                    lat: location.latitude,
                    lng: location.longitude,
                  }}
                  stationType="epit"
                />
              ))}
            </>
          )}
        </NaverMap>
      </MapDiv>
    </div>
  );
};

export default StationSearchPage;
