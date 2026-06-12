import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMenuPermission } from "@/entities/user";
import type { TPermissionKey } from "@/entities/user";

interface Props {
  menuId: string;
  permissionKey?: TPermissionKey;
  children: ReactNode;
}

const PermissionRoute = ({
  menuId,
  permissionKey = "read",
  children,
}: Props) => {
  const { canAccessMenu, isPermissionInitialized } = useMenuPermission();

  if (!isPermissionInitialized) {
    return null;
  }

  if (!canAccessMenu(menuId, permissionKey)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
