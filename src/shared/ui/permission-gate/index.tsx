import type { ReactNode } from "react";

interface Props {
  allow: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGate = ({ allow, children, fallback = null }: Props) => {
  if (!allow) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
