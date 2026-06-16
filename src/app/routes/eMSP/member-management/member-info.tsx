import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import { MENU_ID } from "@/entities/user";
import MemberInfoPage from "@/pages/eMSP/member-management/member-info";

const MemberInfoRoute = () => {
  return (
    <PermissionRoute menuId={MENU_ID.EMSP_MEMBER_INFO}>
      <MemberInfoPage />
    </PermissionRoute>
  );
};

export default MemberInfoRoute;
