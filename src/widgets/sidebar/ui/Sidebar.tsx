import type { SvgIconComponent } from "@mui/icons-material";
import {
  AccountTreeOutlined,
  BoltOutlined,
  BusinessOutlined,
  ChevronRight,
  DashboardOutlined,
  ExpandMore,
  FolderOutlined,
  GroupsOutlined,
  SettingsOutlined,
  StarBorderRounded,
  StarRounded,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { TMenuPermission } from "@/entities/user";
import { useMainInfo } from "@/entities/user";
import { SCREEN_ID } from "@/shared/config";
import { flattenTree } from "@/shared/lib/utils";

import { useSidebarFavorites } from "../model/useSidebarFavorites";

const menuIconMap: Partial<Record<string, SvgIconComponent>> = {
  [SCREEN_ID.DASHBOARD]: DashboardOutlined,
  [SCREEN_ID.CPOS.CPOS]: BoltOutlined,
  [SCREEN_ID.CPOS.STATION_ROOT]: AccountTreeOutlined,
  [SCREEN_ID.CPOS.CHARGER_ROOT]: SettingsOutlined,
  [SCREEN_ID.EMSP.EMSP]: GroupsOutlined,
  [SCREEN_ID.EMSP.MEMBER_MANAGEMENT]: GroupsOutlined,
  [SCREEN_ID.EMSP.CORPORATE_MEMBER]: BusinessOutlined,
  [SCREEN_ID.PLATFORM_MANAGEMENT]: SettingsOutlined,
};

const collectExpandedMenuIds = (menus: TMenuPermission[]) => {
  const expandedIds = new Set<string>();

  const visit = (items: TMenuPermission[]) => {
    for (const item of items) {
      if (item.expanded) {
        expandedIds.add(item.id);
      }

      visit(item.children ?? []);
    }
  };

  visit(menus);

  return expandedIds;
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userInfo,
    partnerInfo,
    menuPermissions,
    isMainInfoInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  } = useMainInfo();
  const { favoriteMenuIds, toggleFavorite } = useSidebarFavorites();
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(
    () => new Set(),
  );

  const initialExpandedMenuIds = useMemo(
    () => collectExpandedMenuIds(menuPermissions),
    [menuPermissions],
  );

  useEffect(() => {
    setExpandedMenuIds(initialExpandedMenuIds);
  }, [initialExpandedMenuIds]);

  const favoriteMenus = useMemo(() => {
    const menuById = new Map<string, TMenuPermission>(
      flattenTree(menuPermissions, (menu) => menu.children).map((menu) => [
        menu.id,
        menu,
      ]),
    );

    return [...favoriteMenuIds].flatMap((menuId) => {
      const menu = menuById.get(menuId);

      if (!menu || !menu.url || !canAccessMenu(menu.id)) {
        return [];
      }

      return [menu];
    });
  }, [canAccessMenu, favoriteMenuIds, menuPermissions]);

  const toggleExpanded = (menuId: string) => {
    setExpandedMenuIds((current) => {
      const next = new Set(current);

      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }

      return next;
    });
  };

  const renderMenu = (menu: TMenuPermission) => {
    const children = (menu.children ?? []).filter((child) =>
      child.children?.length
        ? canAccessMenuGroup(child.id)
        : canAccessMenu(child.id),
    );
    const hasChildren = children.length > 0;
    const canShowMenu = hasChildren
      ? canAccessMenuGroup(menu.id)
      : canAccessMenu(menu.id);

    if (!canShowMenu) {
      return null;
    }

    const route = menu.url ?? null;
    const isExpanded = expandedMenuIds.has(menu.id);
    const isSelected = route ? location.pathname === route : false;
    const isFavorite = favoriteMenuIds.has(menu.id);
    const MenuIcon = menuIconMap[menu.id] ?? FolderOutlined;

    const handleClick = () => {
      if (hasChildren) {
        toggleExpanded(menu.id);
        return;
      }

      if (route) {
        void navigate(route);
      }
    };

    return (
      <Box component="li" key={menu.id} sx={{ listStyle: "none" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mx: 1,
            mb: 0.25,
          }}
        >
          <ListItemButton
            disabled={!hasChildren && !route}
            onClick={handleClick}
            selected={isSelected}
            sx={{
              minWidth: 0,
              minHeight: 40,
              pl: 1.5 + Math.max(menu.depth - 1, 0) * 1.75,
              pr: 1.25,
              borderRadius: 1,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: "rgba(37, 99, 235, 0.1)",
              },
              "&.Mui-disabled": {
                opacity: 0.5,
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: "inherit",
              }}
            >
              <MenuIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={menu.name}
              slotProps={{
                primary: {
                  noWrap: true,
                  sx: {
                    fontSize: 13,
                    fontWeight: isSelected || hasChildren ? 600 : 500,
                  },
                },
              }}
            />
            {hasChildren &&
              (isExpanded ? (
                <ExpandMore fontSize="small" />
              ) : (
                <ChevronRight fontSize="small" />
              ))}
          </ListItemButton>

          {!hasChildren && route && (
            <Tooltip title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}>
              <IconButton
                aria-label={
                  isFavorite
                    ? `${menu.name} 즐겨찾기 해제`
                    : `${menu.name} 즐겨찾기 추가`
                }
                onClick={() => toggleFavorite(menu.id)}
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  ml: 0.25,
                  flexShrink: 0,
                  color: isFavorite ? "warning.main" : "text.disabled",
                }}
              >
                {isFavorite ? (
                  <StarRounded fontSize="small" />
                ) : (
                  <StarBorderRounded fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {children.map((child) => renderMenu(child))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Stack sx={{ height: "100%", bgcolor: "background.paper" }}>
      <Box sx={{ px: 2.5, py: 2.25 }}>
        <Typography
          component="div"
          sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}
        >
          Admin Console
        </Typography>
        <Typography
          sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}
          noWrap
        >
          {partnerInfo?.partnerName ?? "사용자 정보 확인 중"}
        </Typography>
      </Box>

      <Divider />

      <Box
        component="nav"
        aria-label="주요 메뉴"
        sx={{ flex: 1, overflowY: "auto", py: 1.25 }}
      >
        {isMainInfoInitialized ? (
          <List disablePadding>
            {menuPermissions.map((menu) => renderMenu(menu))}
          </List>
        ) : (
          <Stack spacing={1} sx={{ px: 2 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                height={36}
                sx={{ borderRadius: 1 }}
                variant="rectangular"
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Box
        component="section"
        aria-labelledby="sidebar-favorites-title"
        sx={{ maxHeight: 224, overflowY: "auto", py: 1 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", px: 2.5, py: 0.75 }}
        >
          <StarRounded sx={{ fontSize: 17, color: "warning.main" }} />
          <Typography
            id="sidebar-favorites-title"
            sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}
          >
            즐겨찾기
          </Typography>
        </Stack>

        {favoriteMenus.length > 0 ? (
          <List disablePadding>
            {favoriteMenus.map((menu) => {
              const route = menu.url;

              if (!route) {
                return null;
              }

              const MenuIcon = menuIconMap[menu.id] ?? FolderOutlined;
              const isSelected = location.pathname === route;

              return (
                <Box
                  component="li"
                  key={menu.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mx: 1,
                    mb: 0.25,
                    listStyle: "none",
                  }}
                >
                  <ListItemButton
                    onClick={() => void navigate(route)}
                    selected={isSelected}
                    sx={{
                      minWidth: 0,
                      minHeight: 36,
                      px: 1.5,
                      borderRadius: 1,
                      color: "text.secondary",
                      "&.Mui-selected": {
                        color: "primary.main",
                        bgcolor: "rgba(37, 99, 235, 0.1)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                      <MenuIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={menu.name}
                      slotProps={{
                        primary: {
                          noWrap: true,
                          sx: { fontSize: 13, fontWeight: 500 },
                        },
                      }}
                    />
                  </ListItemButton>

                  <Tooltip title="즐겨찾기 해제">
                    <IconButton
                      aria-label={`${menu.name} 즐겨찾기 해제`}
                      onClick={() => toggleFavorite(menu.id)}
                      size="small"
                      sx={{
                        width: 32,
                        height: 32,
                        ml: 0.25,
                        flexShrink: 0,
                        color: "warning.main",
                      }}
                    >
                      <StarRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </List>
        ) : (
          <Typography
            sx={{ px: 2.5, py: 1, fontSize: 12, color: "text.disabled" }}
          >
            등록된 즐겨찾기가 없습니다.
          </Typography>
        )}
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {userInfo?.departmentName ?? "사용자 부서 정보가 없습니다."}
        </Typography>
      </Box>
    </Stack>
  );
};
