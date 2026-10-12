export interface ChargingSpeedDivisionCount {
  availCpkW: number;
  availableCount: number;
  totalCount: number;
}

export type StationParkingType =
  | "FREE"
  | "PUBLIC"
  | "GOVERNMENT"
  | "OPTIONAL_FREE";

export interface ChargingSpeedGroup {
  groupName: string;
  minPowerKw: number;
  maxPowerKw: number;
  availableCount: number;
  totalCount: number;
}

export interface ChargingSpeedGroupDivisionCount {
  groups: ChargingSpeedGroup[];
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

export interface ChargingStationDetail {
  locationId: string;
  name: string;
  imageUrls: string[];
  csId: string;
  cpoId: string;
  cpoName: string;
  roadAddress: string;
  address: string;
  addressDetail: string;
  latitude: number;
  longitude: number;
  publicOpenYn: boolean;
  parkingType: StationParkingType;
  parkingFeeYn?: boolean;
  qrScanYn: boolean;
  pncYn: boolean;
  chargingSpeedDivisionCount: ChargingSpeedDivisionCount[];
  chargingSpeedGroupDivisionCount: ChargingSpeedGroupDivisionCount;
  openingTimes: string;
  tellNumber: string;
  evseResponses: EvseResponse[];
  distanceMeters: number;
}

export interface ChargerGroupRow {
  key: string;
  label: string;
  available: number;
  total: number;
}
