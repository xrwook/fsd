import type { MarkerStatus } from "@/shared/ui/map";

export interface ChargingSpeedDivisionCount {
  availCpkW: number;
  availableCount: number;
  totalCount: number;
}

export interface ChargingSpeedGroup {
  groupName: string;
  minPowerKw: number;
  maxPowerKw: number;
  availableCount: number;
  totalCount: number;
}

export interface Evse {
  cpId: string;
  cpName: string;
  chargerType: string;
  availCpkW: number;
  status: string;
  chargeEndDate: string;
}

export interface EvseResponse {
  availCpkW: number;
  evses: Evse[];
}

interface ChargingStationBase {
  locationId: string;
  name: string;
  cpoId: string;
  cpoName: string;
  latitude: number;
  longitude: number;
  roadAddress: string;
  address: string;
  addressDetail: string;
  chargingSpeedDivisionCount: ChargingSpeedDivisionCount[];
  chargingSpeedGroupDivisionCount: {
    groups: ChargingSpeedGroup[];
  };
}

export interface ChargingStationDetail extends ChargingStationBase {
  distanceMeters: number;
  publicOpenYn: boolean;
  parkingType: string;
  qrScanYn: boolean;
  pncYn: boolean;
  imageUrls: string[];
  csId: string;
  openingTimes: string;
  tellNumber: string;
  evseResponses: EvseResponse[];
}

export interface RawStationRecord extends ChargingStationBase {
  locationStatus: MarkerStatus;
  eventDiscountRate?: number;
  distanceMeters?: number;
  radiusMeters?: number;
  publicOpenYn?: boolean;
  parkingType?: string;
  parkingFeeYn?: boolean;
  qrScanYn?: boolean;
  pncYn?: boolean;
  imageUrls?: string[];
  csId: string;
  openingTimes?: string;
  tellNumber?: string;
  evseResponses?: EvseResponse[];
}

export interface SearchStationResultProps {
  id: string;
  name: string;
  address: string;
}
