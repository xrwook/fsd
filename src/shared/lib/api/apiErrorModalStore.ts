export type ApiErrorModalItem = {
  code?: string;
  id: number;
  message: string;
  status?: number;
  title: string;
  trace?: string;
};

export type ApiErrorModalPayload = Omit<ApiErrorModalItem, "id">;

type ApiErrorModalState = {
  current: ApiErrorModalItem | null;
  queue: ApiErrorModalItem[];
};

const DEFAULT_ERROR_TITLE = "오류가 발생했습니다.";
const DEFAULT_ERROR_MESSAGE = "요청 처리 중 오류가 발생했습니다.";

let nextErrorId = 1;
let state: ApiErrorModalState = {
  current: null,
  queue: [],
};

const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

const setState = (nextState: ApiErrorModalState) => {
  state = nextState;
  emitChange();
};

export const getApiErrorModalState = () => state;

export const subscribeApiErrorModal = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const showApiErrorModal = (payload: ApiErrorModalPayload) => {
  const item: ApiErrorModalItem = {
    ...payload,
    id: nextErrorId,
    message: payload.message || DEFAULT_ERROR_MESSAGE,
    title: payload.title || DEFAULT_ERROR_TITLE,
  };

  nextErrorId += 1;

  if (state.current) {
    setState({
      ...state,
      queue: [...state.queue, item],
    });
    return;
  }

  setState({
    ...state,
    current: item,
  });
};

export const closeApiErrorModal = () => {
  const [nextItem, ...restQueue] = state.queue;

  setState({
    current: nextItem ?? null,
    queue: restQueue,
  });
};
