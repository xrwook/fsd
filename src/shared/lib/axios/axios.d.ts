import "axios";

declare module "axios" {
  // Axios 원본 선언과 동일한 제네릭 시그니처를 유지해야 합니다.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AxiosRequestConfig<_D = any> {
    pageId?: string;
    skipPageId?: boolean;
  }
}
