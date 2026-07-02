import { type PropsWithChildren, useLayoutEffect, useState } from "react";

import type { TMenuId } from "@/entities/user";
import { clearRequestPageId, setRequestPageId } from "@/shared/lib/axios";

type TPageRequestScopeProps = PropsWithChildren<{
  pageId: TMenuId;
}>;

/**
 * 현재 화면의 pageId를 공통 요청 context에 등록해 Axios 요청 헤더에 사용되도록 합니다.
 */
export const PageRequestScope = ({
  children,
  pageId,
}: TPageRequestScopeProps) => {
  const [registeredPageId, setRegisteredPageId] = useState<TMenuId | null>(
    null,
  );

  // 자식 페이지의 API 요청보다 먼저 pageId가 등록되도록 layout effect에서 동기화합니다.
  useLayoutEffect(() => {
    setRequestPageId(pageId);
    setRegisteredPageId(pageId);

    return () => {
      // 다른 화면으로 이동할 때 이전 pageId가 다음 요청에 사용되지 않도록 제거합니다.
      clearRequestPageId(pageId);
    };
  }, [pageId]);

  // request context에 pageId가 등록될 때까지 자식 렌더링을 보류해 초기 API 요청의 헤더 누락을 방지합니다.
  if (registeredPageId !== pageId) {
    return null;
  }

  return children;
};
