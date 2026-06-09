import { WelcomeWidget } from "@/widgets/welcome";
import { usePermission } from "@/entities/user";
import PermissionGate from "@/shared/ui/permission-gate";

const Home = () => {
  const { role, canAccessAction } = usePermission();

  return (
    <div className="space-y-4">
      <WelcomeWidget />

      <section className="mx-auto max-w-[320px] rounded-2xl border border-gray-200 p-4">
        <p className="text-sm text-gray-600">현재 역할: {role ?? "guest"}</p>

        <div className="mt-3 flex gap-2">
          <PermissionGate
            allow={canAccessAction("post:create")}
            fallback={
              <button
                type="button"
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-500"
                disabled
              >
                글 생성 불가
              </button>
            }
          >
            <button
              type="button"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white"
            >
              글 생성
            </button>
          </PermissionGate>

          <PermissionGate allow={canAccessAction("button:export")}
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
    </div>
  );
};

export default Home;
