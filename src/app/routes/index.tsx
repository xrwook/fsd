import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import HomePage from "@/pages/home";

const HomeRoute = () => {
  return (
    <PermissionRoute menuId="dashboard">
      <HomePage />
    </PermissionRoute>
  );
};

export default HomeRoute;
