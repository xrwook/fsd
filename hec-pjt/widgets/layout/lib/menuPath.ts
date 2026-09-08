import type { MenuPermission } from '@/entities/user';

export const normalizePath = (url: string | null | undefined) => {
  if (!url || url === '#') {
    return null;
  }

  const pathname = url.split(/[?#]/)[0]?.replace(/\/+$/, '');

  return pathname || '/';
};

export const isPathMatched = (
  url: string | null | undefined,
  pathname: string,
) => {
  const menuPath = normalizePath(url);

  if (!menuPath) {
    return false;
  }

  if (menuPath === '/') {
    return pathname === '/';
  }

  return pathname === menuPath || pathname.startsWith(`${menuPath}/`);
};

const menuContainsPath = (menu: MenuPermission, pathname: string): boolean => {
  return (
    isPathMatched(menu.url, pathname) ||
    (menu.children ?? []).some((child) => menuContainsPath(child, pathname))
  );
};

export const findTopMenuByPath = (
  menus: MenuPermission[],
  pathname: string,
) => menus.find((menu) => menuContainsPath(menu, pathname));
