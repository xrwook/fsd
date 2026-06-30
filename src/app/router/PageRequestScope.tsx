import { type PropsWithChildren, useLayoutEffect, useState } from "react";

import type { TMenuId } from "@/entities/user";
import { clearRequestPageId, setRequestPageId } from "@/shared/lib/axios";

type TPageRequestScopeProps = PropsWithChildren<{
  pageId: TMenuId;
}>;

export const PageRequestScope = ({
  children,
  pageId,
}: TPageRequestScopeProps) => {
  const [registeredPageId, setRegisteredPageId] = useState<TMenuId | null>(
    null,
  );

  useLayoutEffect(() => {
    setRequestPageId(pageId);
    setRegisteredPageId(pageId);

    return () => {
      clearRequestPageId(pageId);
    };
  }, [pageId]);

  if (registeredPageId !== pageId) {
    return null;
  }

  return children;
};
