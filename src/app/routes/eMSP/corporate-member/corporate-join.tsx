import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import { MENU_ID } from "@/entities/user";
import CorporateJoinPage from "@/pages/eMSP/corporate-member/corporate-join";

const CorporateJoinRoute = () => {
  return (
    <PermissionRoute menuId={MENU_ID.EMSP_CORPORATE_JOIN_MANAGEMENT}>
      <CorporateJoinPage />
    </PermissionRoute>
  );
};

export default CorporateJoinRoute;
// http://localhost:3000/emsp/corporate-member/corporate-join
// http://localhost:3000/emsp/corporate-member/payment-settlement
