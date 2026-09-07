const NetworkErrorPage = () => {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-600">
        Network Error
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        서버와 통신할 수 없습니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        네트워크 연결 또는 서버 상태를 확인한 뒤 다시 시도해 주세요.
      </p>
      <div className="mt-6">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          새로고침
        </button>
      </div>
    </section>
  );
};

export default NetworkErrorPage;
