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

import { isPathMatched } from '../lib/menuPath';

interface Props {
  manualCollapsed: boolean;
  setManualCollapsed: (value: boolean) => void;

  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  showPersistentLnb?: boolean;
}

export const Lnb = ({
  manualCollapsed,
  setManualCollapsed,
  drawerOpen,
  setDrawerOpen,
  showPersistentLnb,
}: Props) => {
  // const { headerMenus } = useMainInfo();
  const { sidebarHidden, sidebarCollapsed } = useNavigationBreakpoint();
  const { menuPermissions, canAccessMenu, canAccessMenuGroup } = useMainInfo();
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
        selected={isPathMatched(item.url, location.pathname)}
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
            {menuPermissions.map((item) => renderMenus(item))}
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
            {menuPermissions.map((item) => renderMenus(item))}
          </NavigationMenuWrapper>
        </NavigationSidebar>
      )}
    </>
  );
};
