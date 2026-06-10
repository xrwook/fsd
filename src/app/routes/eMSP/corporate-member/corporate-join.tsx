import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import CorporateJoinPage from "@/pages/eMSP/corporate-member/corporate-join";

const CorporateJoinRoute = () => {
  return (
    <PermissionRoute menuId="emsp-corporate-join-management">
      <CorporateJoinPage />
    </PermissionRoute>
  );
};

export default CorporateJoinRoute;
// http://localhost:3000/emsp/corporate-member/corporate-join
// http://localhost:3000/emsp/corporate-member/payment-settlement