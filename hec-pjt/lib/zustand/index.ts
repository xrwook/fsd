import type { StateCreator } from 'zustand';
import { create } from 'zustand';
import type { PersistOptions as ZustandPersistOptions } from 'zustand/middleware';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { IS_DEV_MODE, IS_MOCK_MODE } from '@/shared/config';

import { createSelectors } from './selector';
import type { StoreMutators } from './types';

type PersistOptions<TState> = Pick<
  ZustandPersistOptions<TState, Partial<TState>>,
  'partialize' | 'storage'
>;

type CreateStoreOptions<TState> = {
  /** persist 미들웨어 사용 여부 (기본값: false) */
  usePersist?: boolean;
  /** persist 설정 (usePersist가 true일 때만 사용) */
  persistOptions?: PersistOptions<TState>;
};

/**
 * Zustand 스토어 생성 헬퍼 함수
 * - devtools, immer 미들웨어 자동 적용
 * - persist는 옵션으로 선택 가능
 * @param slice - 상태와 액션을 정의하는 StateCreator
 * @param name - 스토어 이름 (devtools, persist key로 사용)
 * @param options - 스토어 옵션 (usePersist, persistOptions)
 */
export const createStore = <TState extends object>(
  slice: StateCreator<TState, StoreMutators, []>,
  name: string,
  options?: CreateStoreOptions<TState>,
) => {
  const { usePersist = false, persistOptions } = options || {};

  // persist 사용 시
  if (usePersist) {
    return createSelectors(
      create<TState, StoreMutators>(
        devtools(
          immer(
            persist(slice, {
              name,
              ...persistOptions,
            }),
          ),
          { name, enabled: IS_DEV_MODE || IS_MOCK_MODE },
        ),
      ),
    );
  }

  // persist 미사용 시
  return createSelectors(
    create<TState, StoreMutators>(
      devtools(immer(slice as never), {
        name,
        enabled: IS_DEV_MODE || IS_MOCK_MODE,
      }),
    ),
  );
};
