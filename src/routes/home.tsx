import type { Route } from "@/routes/+types/home";
import { redirect } from "react-router";
import { getUserPermissionApi } from "@/entities/user/api";
import { hasMenuPermission } from "@/entities/user/lib/permission/config";
import HomePage from "@/pages/home";

// 홈 페이지의 문서 메타 정보를 설정합니다.
export function meta(_args: Route.MetaArgs) {
  return [
    { title: "FSD Test" },
    { name: "description", content: "Feature-Sliced Design starter app" },
  ];
}

// 페이지 진입 전 권한을 검사하고, 미허용 사용자는 403 페이지로 보냅니다.
export async function loader() {
  try {
    const response = await getUserPermissionApi();

    // URL 직접 접근을 포함한 페이지 진입은 loader 단계에서 먼저 차단합니다.
    if (!hasMenuPermission(response.permissions, "dashboard", "read")) {
      return redirect("/forbidden");
    }

    return null;
  } catch {
    // 권한 조회 실패도 접근 불가로 처리해 동일한 403 화면으로 유도합니다.
    return redirect("/forbidden");
  }
}

// 권한 검사는 loader에서 끝내고 화면은 정상 케이스만 렌더링합니다.
const Home = () => {
  return <HomePage />;
};

export default Home;
