import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import PaymentSettlementPage from "@/pages/eMSP/corporate-member/payment-settlement";

const PaymentSettlementRoute = () => {
  return (
    <PermissionRoute menuId="emsp-corporate-payment-settlement">
      <PaymentSettlementPage />
    </PermissionRoute>
  );
};

export default PaymentSettlementRoute;
