import { useCallback, useMemo } from "react";

import { useGetMainInfoQuery } from "../../api";
import type { TMenuPermission, TMenuPermissionField } from "./models";
import type { MenuData } from "./types";
import {
  createMenuPermissions,
  hasChildrenMenuPermission,
  hasMenuPermission,
} from "./utils";
import type { ScreenIdValues } from "@/shared/config";

type TMainMenu = {
  name: string;
  screenId: string;
  path: string;
};

const EMPTY_MENU_PERMISSIONS: TMenuPermission[] = [];
const EMPTY_MAIN_MENUS: TMainMenu[] = [];

const isNavigableMenuUrl = (url: string) => {
  return Boolean(url && url !== "#");
};

const findFirstMenuPath = (menu: MenuData): string => {
  for (const child of menu.children) {
    if (isNavigableMenuUrl(child.url)) {
      return child.url;
    }

    const childPath = findFirstMenuPath(child);

    if (childPath) {
      return childPath;
    }
  }

  return isNavigableMenuUrl(menu.url) ? menu.url : "";
};

const createMainMenus = (menus: MenuData[]): TMainMenu[] => {
  return menus.map((menu) => ({
    name: menu.name,
    screenId: menu.screenId,
    path: findFirstMenuPath(menu),
  }));
};

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
  const mainMenus = useMemo(
    () =>
      mainInfoData ? createMainMenus(mainInfoData.menus) : EMPTY_MAIN_MENUS,
    [mainInfoData],
  );
  const userInfo = mainInfoData?.userInfo ?? null;
  const partnerInfo = mainInfoData?.partnerInfo ?? null;

  // 초기화 전에는 권한 데이터가 아직 없으므로 모든 접근을 보류합니다.
  const canAccessMenu = useCallback(
    (
      screenId: ScreenIdValues,
      permissionField: TMenuPermissionField = "canRead",
    ) => {
      if (!isFetched) {
        return false;
      }

      return hasMenuPermission(menuPermissions, screenId, permissionField);
    },
    [isFetched, menuPermissions],
  );

  const canCreate = useCallback(
    (screenId: ScreenIdValues) => canAccessMenu(screenId, "canCreate"),
    [canAccessMenu],
  );

  const canUpdate = useCallback(
    (screenId: ScreenIdValues) => canAccessMenu(screenId, "canUpdate"),
    [canAccessMenu],
  );

  const canDelete = useCallback(
    (screenId: ScreenIdValues) => canAccessMenu(screenId, "canDelete"),
    [canAccessMenu],
  );

  const canDownload = useCallback(
    (screenId: ScreenIdValues) => canAccessMenu(screenId, "canDownload"),
    [canAccessMenu],
  );

  // 사이드바/상위 폴더처럼 하위 메뉴 권한까지 포함해서 판단할 때 사용합니다.
  // #TODO
  const canAccessMenuGroup = useCallback(
    (
      screenId: ScreenIdValues,
      permissionField: TMenuPermissionField = "canRead",
    ) => {
      if (!isFetched) {
        return false;
      }

      return hasChildrenMenuPermission(
        menuPermissions,
        screenId,
        permissionField,
      );
    },
    [isFetched, menuPermissions],
  );

  return {
    mainInfoData,
    userInfo,
    partnerInfo,
    mainMenus,
    menuPermissions,
    isMainInfoInitialized: isFetched,
    canAccessMenu,
    canAccessMenuGroup,
    canCreate,
    canUpdate,
    canDelete,
    canDownload,
  };
};
