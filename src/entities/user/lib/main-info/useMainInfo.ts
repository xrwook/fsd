import { useCallback, useMemo } from "react";

import { useGetMainInfoQuery } from "../../api";
import type { TMenuPermission, TMenuPermissionField } from "./models";
import {
  createMenuPermissions,
  hasChildrenMenuPermission,
  hasMenuPermission,
} from "./utils";

const EMPTY_MENU_PERMISSIONS: TMenuPermission[] = [];

/**
 * 로그인 사용자의 기본 정보와 메뉴 접근 권한을 관리하는 훅입니다.
 */
export const useMainInfo = () => {
  const { data: mainInfoData = null, isFetched } = useGetMainInfoQuery();
  const menuPermissions = useMemo(
    () =>
      mainInfoData
        ? createMenuPermissions(mainInfoData.menus)
        : EMPTY_MENU_PERMISSIONS,
    [mainInfoData],
  );
  const userInfo = mainInfoData?.userInfo ?? null;
  const partnerInfo = mainInfoData?.partnerInfo ?? null;

  // 초기화 전에는 권한 데이터가 아직 없으므로 모든 접근을 보류합니다.
  const canAccessMenu = useCallback(
    (menuId: string, permissionField: TMenuPermissionField = "canRead") => {
      if (!isFetched) {
        return false;
      }

      return hasMenuPermission(menuPermissions, menuId, permissionField);
    },
    [isFetched, menuPermissions],
  );

  // 사이드바/상위 폴더처럼 하위 메뉴 권한까지 포함해서 판단할 때 사용합니다.
  // #TODO
  const canAccessMenuGroup = useCallback(
    (menuId: string, permissionField: TMenuPermissionField = "canRead") => {
      if (!isFetched) {
        return false;
      }

      return hasChildrenMenuPermission(
        menuPermissions,
        menuId,
        permissionField,
      );
    },
    [isFetched, menuPermissions],
  );

  return {
    mainInfoData,
    userInfo,
    partnerInfo,
    menuPermissions,
    isMainInfoInitialized: isFetched,
    canAccessMenu,
    canAccessMenuGroup,
  };
};
