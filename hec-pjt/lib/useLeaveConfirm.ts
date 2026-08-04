import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';

import { useSystemModal } from '@/shared/lib/modal';

type UseLeaveConfirmOptions = {
  isDirty: boolean;
  message?: string;
  skipRef?: RefObject<boolean>;
};

const DEFAULT_MESSAGE =
  '변경된 내용이 저장되지 않습니다. 페이지를 이탈하시겠습니까?';

export const useLeaveConfirm = ({
  isDirty,
  skipRef,
  message = DEFAULT_MESSAGE,
}: UseLeaveConfirmOptions) => {
  const { confirm } = useSystemModal();
  const blocker = useBlocker(isDirty);
  const isConfirming = useRef(false);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    const skip = skipRef?.current ?? false;

    if (skip) {
      blocker.proceed();
      return;
    }

    isConfirming.current = true;

    confirm({ message }).then(confirmed => {
      isConfirming.current = false;

      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    });
  }, [blocker]);

  /** 브라우저 동작으로 페이지 이탈 시 브라우저 기본 경고 메시지 표시 */
  useEffect(() => {
    const skip = skipRef?.current ?? false;

    if (!isDirty || skip) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, skipRef]);
};