import { Navigate } from "react-router-dom";
import { usePermission } from "@/entities/user";
import HomePage from "@/pages/home";

const HomeRoute = () => {
  const { canAccessMenu, isPermissionInitialized } = usePermission();

  if (!isPermissionInitialized) {
    return null;
  }

  if (!canAccessMenu("dashboard", "read")) {
    return <Navigate to="/forbidden" replace />;
  }

  return <HomePage />;
};

export default HomeRoute;
