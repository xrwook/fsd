import { Link } from "react-router-dom";

import { useApiErrorPageStore } from "@/shared/lib/api-error";

const AccessDeniedPage = () => {
  const clearApiErrorPage = useApiErrorPageStore(
    (state) => state.clearApiErrorPage,
  );

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-600">
        Access Denied
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        접근 권한이 없습니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        현재 계정으로는 요청한 화면에 접근할 수 없습니다.
      </p>
      <div className="mt-6">
        <Link
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onClick={clearApiErrorPage}
          to="/"
        >
          홈으로 이동
        </Link>
      </div>
    </section>
  );
};

export default AccessDeniedPage;
