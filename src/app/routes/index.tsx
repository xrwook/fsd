import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import { MENU_ID } from "@/entities/user";
import HomePage from "@/pages/home";

const HomeRoute = () => {
  return (
    <PermissionRoute menuId={MENU_ID.DASHBOARD}>
      <HomePage />
    </PermissionRoute>
  );
};

export default HomeRoute;
