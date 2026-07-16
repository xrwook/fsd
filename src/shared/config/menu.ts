import type { ValuesType } from "utility-types";

export const SCREEN_ID = {
  DASHBOARD: "DASHBOARD",
  CPOS: {
    CPOS: "CPOS",
    STATION_ROOT: "station-root",
    STATION_MANAGEMENT: "MNU_201",
    STATION_FEE_MANAGEMENT: "station-fee-management",
    POWER_BANK_MANAGEMENT: "power-bank-management",
    CHARGER_ROOT: "charger-root",
    M2M_MODEM_MANAGEMENT: "m2m-modem-management",
    CHARGER_STATUS: "MNU_203",
    CHARGER_CONTROL: "charger-control",
    CHARGER_ERROR_MANAGEMENT: "charger-error-management",
    CLEARING_HOUSE: "clearing-house",
  },
  EMSP: {
    EMSP: "emsp",
    MEMBER_MANAGEMENT: "emsp-member-management",
    MEMBER_INFO: "emsp-member-info",
    MEMBER_INFO_DETAIL: "emsp-member-info-detail",
    MEMBER_PAYMENT: "emsp-member-payment",
    MEMBER_PAYMENT_DETAIL: "emsp-member-payment-detail",
    CORPORATE_MEMBER: "emsp-corporate-member",
    CORPORATE_JOIN_MANAGEMENT: "emsp-corporate-join-management",
    CORPORATE_PAYMENT_SETTLEMENT: "emsp-corporate-payment-settlement",
  },
  PLATFORM_MANAGEMENT: "platform-management",
} as const;

export type ScreenId = ValuesType<typeof SCREEN_ID>;
type NestedValue<T> = T extends object ? NestedValue<ValuesType<T>> : T;
export type ScreenIdValues = NestedValue<ValuesType<typeof SCREEN_ID>>;

export const menu = [{ label: "Home", path: "/" }];
