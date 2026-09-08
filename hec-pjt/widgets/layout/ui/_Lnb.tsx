import {
  NavigationMenuItem,
  NavigationMenuWrapper,
  NavigationSidebar,
  useNavigationBreakpoint,
} from '@hae-fe/pattern';
import { useLocation } from 'react-router-dom';

import type { MenuPermission } from '@/entities/user';
import { useMainInfo } from '@/entities/user';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';

interface Props {
  manualCollapsed: boolean;
  setManualCollapsed: (value: boolean) => void;
  navigation: string | null;

  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  showPersistentLnb?: boolean;
}

const normalizePath = (url: string | null | undefined) => {
  if (!url || url === '#') {
    return null;
  }

  const pathname = url.split(/[?#]/)[0]?.replace(/\/+$/, '');

  return pathname || '/';
};

const matchesPath = (item: MenuPermission, pathname: string): boolean => {
  const itemPath = normalizePath(item.url);

  if (
    itemPath &&
    (itemPath === '/'
      ? pathname === '/'
      : pathname === itemPath || pathname.startsWith(`${itemPath}/`))
  ) {
    return true;
  }

  return (item.children ?? []).some((child) =>
    matchesPath(child, pathname),
  );
};

const findTopMenuByPath = (
  menus: MenuPermission[],
  pathname: string,
) => menus.find((menu) => matchesPath(menu, pathname));

export const Lnb = ({
  manualCollapsed,
  setManualCollapsed,
  navigation,
  drawerOpen,
  setDrawerOpen,
  showPersistentLnb,
}: Props) => {
  // const { headerMenus } = useMainInfo();
  const { sidebarHidden, sidebarCollapsed } = useNavigationBreakpoint();
  const {
    menuPermissions,
    canAccessMenu,
    canAccessMenuGroup,
    findParentUrl,
  } = useMainInfo();
  const location = useLocation();

  const collapsed = sidebarHidden
    ? false
    : (manualCollapsed ?? sidebarCollapsed);

  const renderMenus = (item: MenuPermission) => {
    const children = (item.children ?? []).filter((child) => {
      return child.children?.length
        ? canAccessMenuGroup(child.screenId)
        : canAccessMenu(child.screenId);
    });
    const hasChildren = children.length > 0;
    const canShowMenu = hasChildren
      ? canAccessMenuGroup(item.screenId)
      : canAccessMenu(item.screenId);

    if (!canShowMenu) {
      return null;
    }

    return (
      <NavigationMenuItem
        key={item.screenId}
        label={item.name}
        expressive
        defaultExpanded
        selected={!!item.url && location.pathname === item.url}
        fontWeight={hasChildren ? 'bold' : undefined}
        onClick={() => {
          if (item.type === 'menu' && item.url && item.screenId) {
            navigateToScreen(item.screenId);
          }
        }}
      >
        {hasChildren && (
          <NavigationMenuWrapper>
            {children.map((x) => renderMenus(x))}
          </NavigationMenuWrapper>
        )}
      </NavigationMenuItem>
    );
  };

  // 메뉴
  const parentFromUrl = findParentUrl(location.pathname);
  const currentMenuPermission =
    (parentFromUrl?.screenId
      ? menuPermissions.find((x) => x.screenId === parentFromUrl.screenId)
      : undefined) ??
    findTopMenuByPath(menuPermissions, location.pathname) ??
    menuPermissions.find((x) => x.screenId === navigation);
  const currentChild = currentMenuPermission?.children ?? [];

  return (
    <>
      {/* 상시 사이드바: tablet/desktop에서 표시 */}
      {showPersistentLnb && (
        <NavigationSidebar
          // expressive
          collapsed={collapsed}
          onCollapsedChange={(v) => setManualCollapsed(v)}
          hidden={sidebarHidden}
          showFloatingButton
          className="h-full"
        >
          <NavigationMenuWrapper>
            {currentChild.map((x) => renderMenus(x))}
          </NavigationMenuWrapper>
        </NavigationSidebar>
      )}
      {/* Mobile drawer: sidebarHidden일 때만 렌더링 */}
      {sidebarHidden && drawerOpen && (
        <NavigationSidebar
          overlay
          expressive
          onClose={() => setDrawerOpen(false)}
          showFloatingButton={false}
          className="h-full"
          // hidden={manualCollapsed}
        >
          <NavigationMenuWrapper>
            {/* 모바일에서는 전체 메뉴가 보여야하지 않을까...? */}
            {currentChild.map((x) => renderMenus(x))}
          </NavigationMenuWrapper>
        </NavigationSidebar>
      )}
    </>
  );
};
