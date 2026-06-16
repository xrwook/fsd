import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import { MENU_ID } from "@/entities/user";
import PaymentSettlementPage from "@/pages/eMSP/corporate-member/payment-settlement";

const PaymentSettlementRoute = () => {
  return (
    <PermissionRoute menuId={MENU_ID.EMSP_CORPORATE_PAYMENT_SETTLEMENT}>
      <PaymentSettlementPage />
    </PermissionRoute>
  );
};

export default PaymentSettlementRoute;
