import { emspExtraPageRoutes } from "./emsp";
import type { TExtraPageRoute } from "./types";

// 도메인별 내부 페이지 라우트를 한곳에서 합쳐 DynamicMenuRoute에 제공합니다.
export const extraPageRoutes: TExtraPageRoute[] =
  Object.values({ ...emspExtraPageRoutes }).flat();

export type {
  TExtraPageProps,
  TExtraPageRoute,
  TExtraPageRouteGroups,
} from "./types";
