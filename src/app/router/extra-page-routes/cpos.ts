import { lazy } from "react";

import { SCREEN_ID } from "@/shared/config";

import type { TExtraPageRouteGroups } from "./types";

// API 메뉴에 포함되지 않는 eMSP 상세/등록/수정 페이지입니다.
// 진입 및 화면 액션 권한은 parentMenuId에 해당하는 메뉴 권한을 사용합니다.
export const emspExtraPageRoutes = {
  [SCREEN_ID.CPOS.CHARGER_CONTROL]: [
    {
      relativePath: "/:id",
      parentScreenId: SCREEN_ID.CPOS.CHARGER_CONTROL,
      screenId: SCREEN_ID.CPOS.CHARGER_CONTROL_DETAIL,
      requirePermission: "canRead",
      pages: lazy(() => import("@/pages/CPOS/charger-control")),
    },
  ],
  [SCREEN_ID.CPOS.CLEARING_HOUSE]: [
    {
      relativePath: "/:id",
      parentScreenId: SCREEN_ID.CPOS.CLEARING_HOUSE,
      screenId: SCREEN_ID.CPOS.CLEARING_HOUSE_DETAIL,
      requirePermission: "canRead",
      pages: lazy(
        () => import("@/pages/CPOS/clearing-house"),
      ),
    },
  ],
} satisfies TExtraPageRouteGroups;
