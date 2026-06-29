import type { ValuesType } from "utility-types";

export const MENU_ID = {
  DASHBOARD: "dashboard",
  CPOS: {
    CPOS: "cpos",
    STATION_ROOT: "station-root",
    STATION_MANAGEMENT: "station-management",
    STATION_FEE_MANAGEMENT: "station-fee-management",
    POWER_BANK_MANAGEMENT: "power-bank-management",
    CHARGER_ROOT: "charger-root",
    M2M_MODEM_MANAGEMENT: "m2m-modem-management",
    CHARGER_STATUS: "charger-status",
    CHARGER_CONTROL: "charger-control",
    CHARGER_ERROR_MANAGEMENT: "charger-error-management",
    CLEARING_HOUSE: "clearing-house",
  },
  EMSP: {
    EMSP: "emsp",
    EMSP_MEMBER_MANAGEMENT: "emsp-member-management",
    EMSP_MEMBER_MANAGEMENT_DETAIL: "emsp-member-management-detail",
    EMSP_MEMBER_INFO: "emsp-member-info",
    EMSP_MEMBER_PAYMENT: "emsp-member-payment",
    EMSP_CORPORATE_MEMBER: "emsp-corporate-member",
    EMSP_CORPORATE_JOIN_MANAGEMENT: "emsp-corporate-join-management",
    EMSP_CORPORATE_PAYMENT_SETTLEMENT: "emsp-corporate-payment-settlement",
  },
  PLATFORM_MANAGEMENT: "platform-management",
} as const;

type TNestedValue<T> = T extends object ? TNestedValue<ValuesType<T>> : T;

export type TMenuId = TNestedValue<ValuesType<typeof MENU_ID>>;

const collectMenuIdValues = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  return Object.values(value).flatMap((item) => collectMenuIdValues(item));
};

export const MENU_ID_VALUES = collectMenuIdValues(MENU_ID) as [
  TMenuId,
  ...TMenuId[],
];

const MENU_ID_SET = new Set<string>(MENU_ID_VALUES);

export const isMenuId = (value: unknown): value is TMenuId => {
  return typeof value === "string" && MENU_ID_SET.has(value);
};
