export const CHARGER_CARD_STATE_BY_EVSE_STATUS: Record<
  string,
  "available" | "charging" | "unconfirmed"
> = {
  AVAILABLE: "available",
  BLOCKED: "unconfirmed",
  CHARGING: "charging",
  COMMUNICATION_LOST: "unconfirmed",
  OUT_OF_SERVICE: "unconfirmed",
  UNKNOWN: "unconfirmed",
};
