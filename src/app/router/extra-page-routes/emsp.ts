import { lazy } from "react";

import { MENU_ID, PERMISSION_KEY } from "@/entities/user";

import type { TExtraPageRouteGroups } from "./types";

// API 메뉴에 포함되지 않는 eMSP 상세/등록/수정 페이지입니다.
// 진입 및 화면 액션 권한은 parentMenuId에 해당하는 메뉴 권한을 사용합니다.
export const emspExtraPageRoutes = {
  [MENU_ID.EMSP.EMSP_MEMBER_INFO]: [
    {
      relativePath: "/:memberId",
      parentMenuId: MENU_ID.EMSP.EMSP_MEMBER_INFO,
      requiredPermission: PERMISSION_KEY.READ,
      page: lazy(
        () => import("@/pages/eMSP/member-management/member-info-detail"),
      ),
    },
  ],
  [MENU_ID.EMSP.EMSP_MEMBER_PAYMENT]: [
    {
      relativePath: "/:memberId",
      parentMenuId: MENU_ID.EMSP.EMSP_MEMBER_PAYMENT,
      requiredPermission: PERMISSION_KEY.READ,
      page: lazy(() => import("@/pages/eMSP/member-management/member-payment")),
    },
  ],
} satisfies TExtraPageRouteGroups;
