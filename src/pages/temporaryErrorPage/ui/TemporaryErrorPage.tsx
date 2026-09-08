import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { useApiErrorPageStore } from "@/shared/lib/api-error";

type TemporaryErrorLocationState = {
  from?: string;
};

const TemporaryErrorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearApiErrorPage = useApiErrorPageStore(
    (state) => state.clearApiErrorPage,
  );
  const retryPath =
    (location.state as TemporaryErrorLocationState | null)?.from ?? "/";

  const handleRetry = async () => {
    clearApiErrorPage();
    await queryClient.resetQueries();
    navigate(retryPath, { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
        Temporary Error
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        일시적인 오류가 발생했습니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        잠시 후 다시 시도해 주세요.
      </p>
      <div className="mt-6">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onClick={handleRetry}
          type="button"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
};

export default TemporaryErrorPage;
