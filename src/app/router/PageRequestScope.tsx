import {
  type PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { usePostRecentVisitMutation } from "@/entities/user";
import type { ScreenIdValues } from "@/shared/config";
import { clearRequestScreenId, setRequestScreenId } from "@/shared/lib/api";

type TPageRequestScopeProps = PropsWithChildren<{
  recordRecentVisit?: boolean;
  screenId: ScreenIdValues;
}>;

/**
 * 현재 화면의 screenId를 공통 요청 context에 등록해 Axios 요청 헤더에 사용되도록 합니다.
 */
export const PageRequestScope = ({
  children,
  recordRecentVisit = true,
  screenId,
}: TPageRequestScopeProps) => {
  const { mutate: postRecentVisit } = usePostRecentVisitMutation();
  const [registeredScreenId, setRegisteredScreenId] =
    useState<ScreenIdValues | null>(null);

  // 자식 페이지의 API 요청보다 먼저 screenId가 등록되도록 layout effect에서 동기화합니다.
  useLayoutEffect(() => {
    setRequestScreenId(screenId);
    setRegisteredScreenId(screenId);

    return () => {
      // 다른 화면으로 이동할 때 이전 screenId가 다음 요청에 사용되지 않도록 제거합니다.
      clearRequestScreenId(screenId);
    };
  }, [screenId]);

  useEffect(() => {
    if (!recordRecentVisit || registeredScreenId !== screenId) {
      return;
    }

    postRecentVisit(screenId);
  }, [postRecentVisit, recordRecentVisit, registeredScreenId, screenId]);

  // request context에 screenId가 등록될 때까지 자식 렌더링을 보류해 초기 API 요청의 헤더 누락을 방지합니다.
  if (registeredScreenId !== screenId) {
    return null;
  }

  return children;
};
