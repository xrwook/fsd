import type { ValuesType } from "utility-types";

const commonScreenId = {
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
    CHARGER_CONTROL_DETAIL: "charger-control-detail",
    CHARGER_ERROR_MANAGEMENT: "charger-error-management",
    CLEARING_HOUSE: "clearing-house",
    CLEARING_HOUSE_DETAIL: "clearing-house-detail",
  },
  PLATFORM_MANAGEMENT: "platform-management",
} as const;

const emspScreenId = {
  EMSP: "emsp",
  MEMBER_MANAGEMENT: "emsp-member-management",
  MEMBER_INFO: "emsp-member-info",
  MEMBER_INFO_DETAIL: "emsp-member-info-detail",
  MEMBER_PAYMENT: "emsp-member-payment",
  MEMBER_PAYMENT_DETAIL: "emsp-member-payment-detail",
  CORPORATE_MEMBER: "emsp-corporate-member",
  CORPORATE_JOIN_MANAGEMENT: "emsp-corporate-join-management",
  CORPORATE_PAYMENT_SETTLEMENT: "emsp-corporate-payment-settlement",
} as const;

type EmspScreenId = typeof emspScreenId;

type ScreenIdConfig = typeof commonScreenId & {
  readonly EMSP: EmspScreenId;
};

// Build target is optional outside Vite. Treat an omitted target as internal
// so internal-only modules do not fail during local development.
const isInternalBuild = import.meta.env.VITE_BUILD_TARGET !== "external";

export const SCREEN_ID = {
  ...commonScreenId,
  ...(isInternalBuild
    ? {
        EMSP: emspScreenId,
      }
    : {}),
} as ScreenIdConfig;

export type ScreenId = ValuesType<ScreenIdConfig>;
type NestedValue<T> = T extends object ? NestedValue<ValuesType<T>> : T;
export type ScreenIdValues = NestedValue<ValuesType<ScreenIdConfig>>;

export const menu = [{ label: "Home", path: "/" }];
