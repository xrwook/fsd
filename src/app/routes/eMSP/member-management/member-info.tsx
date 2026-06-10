import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import MemberInfoPage from "@/pages/eMSP/member-management/member-info";

const MemberInfoRoute = () => {
  return (
    <PermissionRoute menuId="emsp-member-info">
      <MemberInfoPage />
    </PermissionRoute>
  );
};

export default MemberInfoRoute;
