import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	// 권한 거부 시 공통으로 이동시키는 403 전용 라우트입니다.
	route("forbidden", "routes/forbidden.tsx"),
] satisfies RouteConfig;
