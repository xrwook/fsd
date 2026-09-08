const TermsReconsentPage = () => {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
        Terms Reconsent
      </p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        약관 재동의가 필요합니다
      </h1>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        서비스를 계속 이용하려면 변경된 약관에 다시 동의해 주세요.
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

export default TermsReconsentPage;
