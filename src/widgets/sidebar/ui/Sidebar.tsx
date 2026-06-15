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
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMenuPermission } from "@/entities/user";
import type { TMenuPermission } from "@/entities/user";
import { menuRouteMap } from "@/widgets/sidebar/config/menu-route-map";

const menuIconMap: Record<string, SvgIconComponent> = {
  dashboard: DashboardOutlined,
  cpos: BoltOutlined,
  "station-root": AccountTreeOutlined,
  "charger-root": SettingsOutlined,
  emsp: GroupsOutlined,
  "emsp-member-management": GroupsOutlined,
  "emsp-corporate-member": BusinessOutlined,
  "platform-management": SettingsOutlined,
};

const collectExpandedMenuIds = (menus: TMenuPermission[]) => {
  const expandedIds = new Set<string>();

  const visit = (items: TMenuPermission[]) => {
    items.forEach((item) => {
      if (item.expanded) {
        expandedIds.add(item.id);
      }

      visit(item.children ?? []);
    });
  };

  visit(menus);

  return expandedIds;
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    permissionName,
    permissionDescription,
    permissionMenus,
    isPermissionInitialized,
    canAccessMenu,
    canAccessMenuGroup,
  } = useMenuPermission();
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(
    () => new Set(),
  );

  const initialExpandedMenuIds = useMemo(
    () => collectExpandedMenuIds(permissionMenus),
    [permissionMenus],
  );

  useEffect(() => {
    setExpandedMenuIds(initialExpandedMenuIds);
  }, [initialExpandedMenuIds]);

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

    const route = menuRouteMap[menu.id];
    const isExpanded = expandedMenuIds.has(menu.id);
    const isSelected = route
      ? location.pathname.toLowerCase() === route.toLowerCase()
      : false;
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
        <ListItemButton
          disabled={!hasChildren && !route}
          onClick={handleClick}
          selected={isSelected}
          sx={{
            minHeight: 40,
            mx: 1,
            mb: 0.25,
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

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>{children.map(renderMenu)}</List>
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
          {permissionName ?? "메뉴 권한 확인 중"}
        </Typography>
      </Box>

      <Divider />

      <Box
        component="nav"
        aria-label="주요 메뉴"
        sx={{ flex: 1, overflowY: "auto", py: 1.25 }}
      >
        {!isPermissionInitialized ? (
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
        ) : (
          <List disablePadding>{permissionMenus.map(renderMenu)}</List>
        )}
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 1.75 }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {permissionDescription ?? "적용된 메뉴 권한이 없습니다."}
        </Typography>
      </Box>
    </Stack>
  );
};
