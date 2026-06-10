import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import MemberPaymentPage from "@/pages/eMSP/member-management/member-payment";

const MemberPaymentRoute = () => {
  return (
    <PermissionRoute menuId="emsp-member-payment">
      <MemberPaymentPage />
    </PermissionRoute>
  );
};

export default MemberPaymentRoute;
