import { Route, Routes } from "react-router-dom";

import { DynamicMenuRoute } from "./DynamicMenuRoute";

export const AppRouter = () => {
  return (
    <Routes>
      {/* 나머지 모든 URL은 API 메뉴 url 기준으로 동적으로 해석합니다. */}
      <Route path="*" element={<DynamicMenuRoute />} />
    </Routes>
  );
};
