import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import { MENU_ID } from "@/entities/user";
import MemberPaymentPage from "@/pages/eMSP/member-management/member-payment";

const MemberPaymentRoute = () => {
  return (
    <PermissionRoute menuId={MENU_ID.EMSP_MEMBER_PAYMENT}>
      <MemberPaymentPage />
    </PermissionRoute>
  );
};

export default MemberPaymentRoute;
