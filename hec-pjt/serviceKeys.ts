import type { QueryKeyParams } from "@/shared/query-keys/types";

const ROOT = ["serviceKeys"] as const;

export const serviceKeys = {
  event: {
    all: () => [...ROOT, "event"] as const,
    lists: [...ROOT, "event", "lists"] as const,
    list: (params?: QueryKeyParams) =>
      [...ROOT, "event", "list", params] as const,
    detail: (id: string) => [...ROOT, "event", "detail", id] as const,
  },
  home: {
    all: () => [...ROOT, "home"] as const,
    recentVisits: (params?: QueryKeyParams) =>
      [...ROOT, "home", "recentVisits", params] as const,
    notices: (params?: QueryKeyParams) =>
      [...ROOT, "home", "notices", params] as const,
    noticeDetail: (id: string) =>
      [...ROOT, "home", "notices", "detail", id] as const,
    favorites: (params?: QueryKeyParams) =>
      [...ROOT, "home", "favorites", params] as const,
  },
  notice: {
    all: () => [...ROOT, "notice"] as const,
    list: (params?: QueryKeyParams) =>
      [...ROOT, "notice", "list", params] as const,
    detail: (id: string) => [...ROOT, "notice", "detail", id] as const,
  },
  faq: {
    all: () => [...ROOT, "faq"] as const,
    list: (params?: QueryKeyParams) =>
      [...ROOT, "faq", "list", params] as const,
    category: (params?: QueryKeyParams) =>
      [...ROOT, "faq", "category", params] as const,
    display: (params?: QueryKeyParams) =>
      [...ROOT, "faq", "display", params] as const,
    top10Status: (params?: QueryKeyParams) =>
      [...ROOT, "faq", "top10Status", params] as const,
    detail: (id: string) => [...ROOT, "faq", "detail", id] as const,
  },
  policy: {
    all: () => [...ROOT, "policy"] as const,
    terms: (params?: QueryKeyParams) =>
      [...ROOT, "policy", "terms", params] as const,
    versionList: (params?: QueryKeyParams) =>
      [...ROOT, "policy", "versionList", params] as const,
    nextVersion: (params?: QueryKeyParams) =>
      [...ROOT, "policy", "nextVersion", params] as const,
    detail: (id: string) => [...ROOT, "policy", "detail", id] as const,
  },
  partnership: {
    all: () => [...ROOT, "partnership"] as const,
    list: (params?: QueryKeyParams) =>
      [...ROOT, "partnership", "list", params] as const,
    detail: (id: number) => [...ROOT, "partnership", "detail", id] as const,
    receivers: () => [...ROOT, "partnership", "receivers"] as const,
    receiverList: () => [...ROOT, "partnership", "receivers", "list"] as const,
    registrableReceiverList: (params?: QueryKeyParams) =>
      [...ROOT, "partnership", "receivers", "registrable", params] as const,
  },
} as const;
