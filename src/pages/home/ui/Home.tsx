import { MENU_ID, useMenuPermission } from "@/entities/user";
import { StationUpdateFormExample } from "@/features/station/update";
import { logoutKeycloak } from "@/shared/lib/keycloak";
import PermissionGate from "@/shared/ui/permission-gate";
import { WelcomeWidget } from "@/widgets/welcome";

const Home = () => {
  const handleLogout = () => {
    logoutKeycloak().catch(() => {});
  };
  const { canAccessMenu } = useMenuPermission();
  return (
    <div className="space-y-4">
      <WelcomeWidget />
      <section className="mx-auto max-w-[320px] rounded-2xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <PermissionGate
            allow={canAccessMenu(MENU_ID.STATION_MANAGEMENT, "write")}
            fallback={
              <button
                type="button"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-500"
                disabled
              >
                충전소 수정 불가
              </button>
            }
          >
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
              onClick={handleLogout}
            >
              충전소 수정
            </button>
          </PermissionGate>

          <PermissionGate
            allow={canAccessMenu(MENU_ID.DASHBOARD, "download")}
            fallback={
              <button
                type="button"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-500"
                disabled
              >
                내보내기 불가
              </button>
            }
          >
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
            >
              내보내기
            </button>
          </PermissionGate>
        </div>
      </section>

      <StationUpdateFormExample />
    </div>
  );
};

export default Home;
