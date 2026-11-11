import { useEffect } from "react";

import { getKeycloakInstance } from "@/shared/lib/keycloak";
import { PageLayout } from "@/widgets/layout/ui";

import { FavoriteMenuTable } from "./_FavoriteMenuTable";
import { NoticeSummaryList } from "./_NoticeSummaryList";
import { RecentMenuTable } from "./_RecentMenuTable";

const LOGIN_ALERT_STORAGE_KEY = "home-main-login-alert-session";
let alertedSessionId: string | undefined;

const HomeMainPage = () => {
  useEffect(() => {
    const keycloak = getKeycloakInstance();
    const sessionId = keycloak?.sessionId;

    if (!keycloak?.authenticated || !sessionId || alertedSessionId === sessionId) {
      return;
    }

    try {
      // 새로고침에도 유지하고, 다시 로그인해 세션 ID가 바뀌면 알림을 표시합니다.
      if (window.sessionStorage.getItem(LOGIN_ALERT_STORAGE_KEY) === sessionId) {
        alertedSessionId = sessionId;
        return;
      }

      window.sessionStorage.setItem(LOGIN_ALERT_STORAGE_KEY, sessionId);
    } catch {
      // 저장소를 사용할 수 없어도 현재 앱에서는 중복 표시하지 않습니다.
    }

    // StrictMode의 effect 재실행 및 홈 재진입 시 중복 표시를 방지합니다.
    alertedSessionId = sessionId;
    alert("추후 정의 예정");
  }, []);

  return (
    <PageLayout title="홈" onFavoriteToggle={() => {}}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <FavoriteMenuTable />
        <RecentMenuTable />
        <NoticeSummaryList />
      </div>
    </PageLayout>
  );
};

export default HomeMainPage;
