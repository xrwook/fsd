const ApprovalExtensionPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600">
        Permission Expired
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        권한 연장이 필요합니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        현재 계정의 사용 권한이 만료되었습니다. 권한 연장 승인 후 다시 이용해
        주세요.
      </p>
      <div className="mt-6">
        <button
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          재확인
        </button>
      </div>
    </main>
  );
};

export default ApprovalExtensionPage;
