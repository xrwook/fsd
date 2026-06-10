import type { Route } from "@/+types/root";
import ForbiddenPage from "@/pages/forbidden";

// 접근 불가 페이지의 문서 메타 정보를 설정합니다.
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "403 Forbidden | FSD Test" },
    { name: "description", content: "Access denied page" },
  ];
}

// ErrorBoundary 대신 사용자 친화적인 접근 불가 화면을 렌더링합니다.
const Forbidden = () => {
  return <ForbiddenPage />;
};

export default Forbidden;
