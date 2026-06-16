import { Route, Routes } from "react-router-dom";
import ForbiddenPage from "@/pages/forbidden";
import { DynamicMenuRoute } from "@/app/router/DynamicMenuRoute";

export const AppRouter = () => {
  return (
    <Routes>
      {/* 403은 권한 실패 시 항상 접근 가능한 고정 라우트입니다. */}
      <Route path="/403" element={<ForbiddenPage />} />
      {/* 나머지 모든 URL은 API 메뉴 url 기준으로 동적으로 해석합니다. */}
      <Route path="*" element={<DynamicMenuRoute />} />
    </Routes>
  );
};
