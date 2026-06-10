export const enableMocking = async () => {
  const shouldUseMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

  if (!shouldUseMockApi || typeof window === "undefined") {
    return;
  }

  const { worker } = await import("@/shared/mocks/browser");

  await worker.start({
    onUnhandledRequest: "bypass",
  });
};
