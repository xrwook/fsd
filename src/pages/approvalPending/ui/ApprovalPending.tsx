import { Link } from "react-router-dom";

import { useApiErrorPageStore } from "@/shared/lib/api-error";

// 접근 권한이 없을 때 안내 메시지와 복귀 액션을 제공합니다.
const ApprovalPending = () => {
  const clearApiErrorPage = useApiErrorPageStore(
    (state) => state.clearApiErrorPage,
  );

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
        ApprovalPending
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">권한 승인 대기중입니다.</h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        권한 승인 대기중입니다.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onClick={clearApiErrorPage}
        >
          홈으로 이동
        </Link>
      </div>
    </section>
  );
};

export default ApprovalPending;
