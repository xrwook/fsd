import { MENU_ID } from "@/entities/user";
import type { TMenuId } from "@/entities/user";

export const menuRouteMap: Partial<Record<TMenuId, string>> = {
  [MENU_ID.DASHBOARD]: "/",
  [MENU_ID.EMSP_MEMBER_INFO]: "/emsp/member-management/member-info",
  [MENU_ID.EMSP_MEMBER_PAYMENT]: "/emsp/member-management/member-payment",
  [MENU_ID.EMSP_CORPORATE_JOIN_MANAGEMENT]:
    "/emsp/corporate-member/corporate-join",
  [MENU_ID.EMSP_CORPORATE_PAYMENT_SETTLEMENT]:
    "/emsp/corporate-member/payment-settlement",
};
