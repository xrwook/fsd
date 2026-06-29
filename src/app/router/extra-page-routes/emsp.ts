import { lazy } from "react";

import { MENU_ID } from "@/entities/user";

import type { TExtraPageRouteGroups } from "./types";

// API 메뉴에 포함되지 않는 eMSP 상세/등록/수정 페이지입니다.
// 진입 및 화면 액션 권한은 parentMenuId에 해당하는 메뉴 권한을 사용합니다.
export const emspExtraPageRoutes = {
  [MENU_ID.EMSP.EMSP_MEMBER_INFO]: [
    {
      path: "/emsp/member-management/members/:memberId",
      parentMenuId: MENU_ID.EMSP.EMSP_MEMBER_INFO,
      requiredPermission: "read",
      page: lazy(() => import("@/pages/eMSP/member-management/member-info")),
    },
  ],
  [MENU_ID.EMSP.EMSP_MEMBER_PAYMENT]: [
    {
      path: "/emsp/member-management/members/:memberId",
      parentMenuId: MENU_ID.EMSP.EMSP_MEMBER_PAYMENT,
      requiredPermission: "read",
      page: lazy(() => import("@/pages/eMSP/member-management/member-payment")),
    },
  ],
} satisfies TExtraPageRouteGroups;
