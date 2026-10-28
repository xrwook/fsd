import {
  NavigationMenuItem,
  NavigationMenuWrapper,
  NavigationSidebar,
  useNavigationBreakpoint,
} from '@hae-fe/pattern';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import type { TMenuPermission } from '@/entities/user';
import { useMainInfo } from '@/entities/user';
import type { ScreenIdValues } from '@/shared/config';
import { navigateToScreen } from '@/shared/lib/navigation/navigation';

import { findTopMenuByPath, isPathMatched } from '../lib/menuPath';

interface Props {
  manualCollapsed: boolean;
  setManualCollapsed: (value: boolean) => void;
  navigation: ScreenIdValues | null;

  drawerOpen: boolean;
  setDrawerOpen: (value: boolean) => void;
  showPersistentLnb?: boolean;
  /** true면 전체 메뉴, false면 현재 대메뉴의 자식 메뉴만 표시합니다. */
  isCompact?: boolean;
}

export const Lnb = ({
  manualCollapsed,
  setManualCollapsed,
  navigation,
  drawerOpen,
  setDrawerOpen,
  showPersistentLnb,
  isCompact = true,
}: Props) => {
  // const { headerMenus } = useMainInfo();
  const { sidebarHidden, sidebarCollapsed } = useNavigationBreakpoint();
  const { menuPermissions, canAccessMenu, canAccessMenuGroup } = useMainInfo();
  const location = useLocation();
  const activeTopMenu =
    findTopMenuByPath(menuPermissions, location.pathname) ??
    menuPermissions.find((menu) => menu.screenId === navigation);
  const activeTopMenuId = activeTopMenu?.screenId ?? null;
  const [expandedTopMenuId, setExpandedTopMenuId] = useState<string | null>(
    activeTopMenuId,
  );

  useEffect(() => {
    setExpandedTopMenuId(activeTopMenuId);
  }, [activeTopMenuId]);

  const collapsed = sidebarHidden
    ? false
    : (manualCollapsed ?? sidebarCollapsed);
  const visibleMenus = isCompact
    ? menuPermissions
    : (activeTopMenu?.children ?? []);

  const renderMenus = (item: TMenuPermission, level = 0) => {
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
        {...(hasChildren && level === 0
          ? {
              expanded: expandedTopMenuId === item.screenId,
              onExpandedChange: (expanded: boolean) => {
                setExpandedTopMenuId(expanded ? item.screenId : null);
              },
            }
          : { defaultExpanded: hasChildren })}
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
            {children.map((x) => renderMenus(x, level + 1))}
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
            {visibleMenus.map((item) =>
              renderMenus(item, isCompact ? 0 : 1),
            )}
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
            {visibleMenus.map((item) =>
              renderMenus(item, isCompact ? 0 : 1),
            )}
          </NavigationMenuWrapper>
        </NavigationSidebar>
      )}
    </>
  );
};
