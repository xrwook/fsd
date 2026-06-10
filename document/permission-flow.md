# 권한 플로우 문서

이 문서는 현재 프로젝트의 데모 권한 흐름을 설명합니다.

현재 권한은 실제 서버 API 대신 mock API/MSW에서 받아오는 메뉴 트리 데이터를 기준으로 판단합니다. 권한 판단 기준은 메뉴 ID와 `read`, `write`, `download` 권한 키입니다.

## 핵심 파일

- `src/main.tsx`
  - 앱 시작 전에 mock API 사용 여부를 확인하고 MSW를 활성화합니다.
  - `QueryProvider`로 React Query 환경을 제공합니다.
  - `BrowserRouter`로 SPA 라우팅을 감쌉니다.
- `src/app/App.tsx`
  - 앱 진입 시 `useInitializePermission()`으로 권한을 초기화합니다.
  - `vite-plugin-pages`가 만든 `~react-pages` 라우트를 `useRoutes()`에 연결합니다.
- `src/app/routes`
  - 파일 시스템 기반 라우팅 디렉터리입니다.
  - 페이지 라우트 파일에서 `PermissionRoute`로 접근 권한을 공통 체크합니다.
- `src/app/routes/_guards/PermissionRoute.tsx`
  - 라우트 접근 권한을 판단하는 공통 guard입니다.
  - 권한이 없으면 `/403`으로 이동합니다.
- `vite.config.ts`
  - `vite-plugin-pages`가 `src/app/routes`를 읽도록 설정합니다.
  - `_guards` 폴더는 라우트로 생성되지 않도록 제외합니다.
- `src/shared/mocks`
  - MSW worker와 `/api/permissions` mock handler를 관리합니다.
- `src/entities/user/api/getUserPermissionApi.ts`
  - mock 모드에서는 `/api/permissions`를 호출하고, MSW 실패 시 직접 mock 응답으로 fallback합니다.
  - mock 모드가 아니면 실제 API 경로로 요청합니다.
  - 응답 데이터는 store에 넣기 전에 zod schema로 검증합니다.
- `src/entities/user/api/userPermissionQueryFactory.ts`
  - 권한 조회 React Query 옵션을 query factory 형태로 제공합니다.
- `src/entities/user/api/mocks/getUserPermissionMockApi.ts`
  - 실제 API처럼 300ms 지연 후 권한 mock 데이터를 반환합니다.
- `src/entities/user/lib/permission/schema.ts`
  - 권한 API 응답과 메뉴 권한 데이터의 zod schema를 관리합니다.
- `src/entities/user/lib/permission/config.ts`
  - `permissionMenuMock` 데이터와 권한 판단 helper를 관리합니다.
- `src/entities/user/model/userStore.ts`
  - 현재 유저, 메뉴 권한, 권한 초기화 완료 여부를 저장합니다.
- `src/entities/user/model/useInitializePermission.ts`
  - 권한 API를 호출하고 응답을 store에 저장합니다.
- `src/entities/user/lib/permission/usePermission.ts`
  - 화면과 route guard에서 사용할 권한 체크 함수를 제공합니다.
- `src/shared/ui/permission-gate/index.tsx`
  - 버튼/기능 단위 권한에 따라 children 또는 fallback을 렌더링합니다.

## 권한 데이터 형태

권한 데이터는 메뉴 트리 형태입니다. 실제 타입은 직접 작성하지 않고 zod schema에서 `z.infer`로 생성합니다.

```ts
const menuPermissionBaseSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  depth: z.number(),
  name: z.string(),
  type: z.enum(["folder", "menu"]),
  expanded: z.boolean().optional(),
  checked: z.boolean(),
  permissions: z.object({
    read: z.boolean(),
    write: z.boolean(),
    download: z.boolean(),
  }),
});

type TMenuPermissionSchema = z.infer<typeof menuPermissionBaseSchema> & {
  children?: TMenuPermissionSchema[];
};

export const menuPermissionSchema: z.ZodType<TMenuPermissionSchema> = z.lazy(
  () =>
    menuPermissionBaseSchema.extend({
      children: z.array(menuPermissionSchema).optional(),
    }),
);

export const permissionApiResponseSchema = z.array(menuPermissionSchema);
```

`types.ts`는 schema를 원본으로 사용합니다.

```ts
export type TMenuPermission = z.infer<typeof menuPermissionSchema>;
export type TPermissionApiResponse = z.infer<
  typeof permissionApiResponseSchema
>;
```

예시:

```ts
{
  id: "station-management",
  parentId: "station-root",
  depth: 3,
  name: "충전소 관리",
  type: "menu",
  checked: true,
  permissions: {
    read: true,
    write: true,
    download: true,
  },
}
```

`checked`는 권한 판단 기준으로 사용하지 않습니다. 접근 허용 여부는 항상 `permissions[permissionKey]` 값을 기준으로 판단합니다.

## 전체 흐름

```text
src/main.tsx
  -> enableMocking()
    -> VITE_USE_MOCK_API !== "false" 이고 브라우저 환경이면 MSW worker 시작
  -> <QueryProvider>
  -> <BrowserRouter>
  -> <App />

src/app/App.tsx
  -> useInitializePermission()
    -> useQuery(userPermissionQueryFactory.current())
      -> getUserPermissionApi()
        -> mock mode
          -> axios GET /api/permissions
          -> MSW handler
          -> getUserPermissionMockApi()
          -> permissionMenuMock 복사본 반환
          -> MSW 실패 시 직접 getUserPermissionMockApi() fallback
        -> real mode
          -> axios GET /api/permissions
        -> permissionApiResponseSchema.safeParse(response)
      -> success
        -> userStore.initializePermission()
          -> permissionMenus
          -> isPermissionInitialized = true
      -> error
        -> userStore.initializePermission()
          -> permissionMenus = null
          -> isPermissionInitialized = true
  -> useRoutes(routes)
    -> routes는 vite-plugin-pages가 src/app/routes에서 생성

route file
  -> <PermissionRoute menuId="..." permissionKey="read">
    -> 초기화 전이면 null
    -> canAccessMenu(menuId, permissionKey)
    -> 권한 없음이면 /403
    -> 권한 있으면 page 렌더링
```

## 초기 상태

`userStore`는 처음에 권한을 모르는 상태로 시작합니다.

```ts
permissionMenus: null;
isPermissionInitialized: false;
```

`isPermissionInitialized`가 `false`인 동안에는 route guard와 버튼 권한 판단을 보류합니다. 이 값이 없으면 mock API 응답이 오기 전에 권한 없음으로 판단되어 화면이 잘못 차단될 수 있습니다.

권한 응답을 받으면 `initializePermission`으로 한 번에 저장합니다.

```ts
initializePermission(response);
```

API 호출 실패 시에도 초기화는 완료 상태로 둡니다.

```ts
initializePermission(null);
```

이렇게 하면 실패 상태에서도 라우트가 무한 대기하지 않고 접근 거부 흐름으로 넘어갑니다.

## mock API 흐름

`src/main.tsx`는 앱 렌더링 전에 `enableMocking()`을 실행합니다.

```ts
void enableMocking().then(() => {
  createRoot(rootElement).render(
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>,
  );
});
```

`VITE_USE_MOCK_API !== "false"`이면 브라우저에서 MSW worker가 시작됩니다.

```ts
await worker.start({
  onUnhandledRequest: "bypass",
});
```

권한 API는 mock 모드에서 먼저 HTTP 요청 흐름을 유지합니다.

```ts
return await axiosInstance.get<unknown>("/api/permissions");
```

MSW handler가 이 요청을 가로채서 mock 응답을 반환합니다.

```ts
http.get("/api/permissions", async () => {
  const response = await getUserPermissionMockApi();

  return HttpResponse.json(response);
});
```

MSW 요청이 실패하면 직접 mock 함수로 fallback합니다.

```ts
return getUserPermissionMockApi();
```

`getUserPermissionMockApi`는 실제 API처럼 300ms 지연 후 `structuredClone`으로 복사본을 반환합니다. store나 화면에서 권한 데이터를 수정해도 원본 mock 데이터가 오염되지 않게 하기 위함입니다.

## 응답 데이터 검증

권한 API 응답은 TypeScript 타입만 믿지 않고 `zod`로 런타임 검증합니다. schema가 타입과 런타임 검증의 기준입니다.

```ts
const result = permissionApiResponseSchema.safeParse(response);

if (!result.success) {
  throw new Error("[permission-api] invalid response data");
}
```

검증을 통과한 메뉴 배열만 `TPermissionApiResponse`로 사용하고 store에 저장합니다.

```ts
return result.data;
```

검증 실패 시 `getUserPermissionApi`가 throw하고, React Query는 해당 요청을 error 상태로 처리합니다. 이후 `useInitializePermission`이 유저와 권한을 비운 상태로 초기화를 완료합니다.

## React Query 흐름

권한 조회는 컴포넌트에서 API 함수를 직접 호출하지 않고 query factory를 통해 실행합니다.

```ts
export const userPermissionQueryFactory = {
  all: () => ["user-permission"] as const,
  current: () =>
    queryOptions({
      queryKey: [...userPermissionQueryFactory.all(), "current"] as const,
      queryFn: getUserPermissionApi,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    }),
};
```

`useInitializePermission`은 query 결과를 구독하고, 성공/실패 상태만 store에 반영합니다.

```ts
const permissionQuery = useQuery(userPermissionQueryFactory.current());
```

성공 시에는 API 응답을 store에 저장합니다.

```ts
initializePermission(permissionQuery.data);
```

실패 시에는 권한을 비우고 초기화 완료 상태로 둡니다.

```ts
initializePermission(null);
```

## 권한 판단 기준

단일 메뉴 권한은 API가 내려준 `permissions` 값을 기준으로 허용됩니다.

```ts
menu.permissions[permissionKey] === true;
```

예시:

```ts
canAccessMenu("station-management", "write");
```

이 호출은 `station-management` 메뉴를 찾고, 해당 메뉴의 `permissions.write`가 true인지 확인합니다.

## 메뉴 그룹 권한

상위 폴더나 사이드바 메뉴처럼 하위 메뉴까지 포함해서 접근 가능 여부를 판단해야 할 때는 `canAccessMenuGroup`을 사용합니다.

```ts
canAccessMenuGroup("cpos", "read");
```

이 함수는 `cpos` 자신 또는 하위 메뉴 중 하나라도 `read: true`이면 허용합니다.

## 라우트 접근 권한

라우트 접근 권한은 `src/app/routes/_guards/PermissionRoute.tsx`에서 공통으로 처리합니다.

```tsx
const PermissionRoute = ({
  menuId,
  permissionKey = "read",
  children,
}: Props) => {
  const { canAccessMenu, isPermissionInitialized } = usePermission();

  if (!isPermissionInitialized) {
    return null;
  }

  if (!canAccessMenu(menuId, permissionKey)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
```

각 라우트 파일은 직접 `Navigate` 조건을 작성하지 않고 `PermissionRoute`로 page를 감쌉니다.

```tsx
import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import HomePage from "@/pages/home";

const HomeRoute = () => {
  return (
    <PermissionRoute menuId="dashboard">
      <HomePage />
    </PermissionRoute>
  );
};

export default HomeRoute;
```

`permissionKey`를 생략하면 기본값은 `read`입니다.

```tsx
<PermissionRoute menuId="dashboard">
  <HomePage />
</PermissionRoute>
```

쓰기 권한이 필요한 라우트라면 명시적으로 지정합니다.

```tsx
<PermissionRoute menuId="station-management" permissionKey="write">
  <StationEditPage />
</PermissionRoute>
```

## 파일 시스템 기반 라우팅

라우트 파일은 `src/app/routes` 아래에 둡니다.

```text
src/app/routes/index.tsx
src/app/routes/403.tsx
src/app/routes/[...notFound].tsx
src/app/routes/eMSP/corporate-member/corporate-join.tsx
src/app/routes/eMSP/corporate-member/payment-settlement.tsx
src/app/routes/eMSP/member-management/member-info.tsx
src/app/routes/eMSP/member-management/member-payment.tsx
```

`vite.config.ts`의 `Pages` 설정이 이 디렉터리를 라우트 소스로 사용합니다.

```ts
Pages({
  dirs: [{ dir: "src/app/routes", baseRoute: "" }],
  exclude: ["**/_guards/**"],
  importMode: "async",
});
```

`_guards` 폴더는 공통 guard를 보관하는 곳이고 실제 URL 라우트가 아니므로 `exclude`에 포함합니다.

## 버튼/기능 권한

버튼이나 기능 단위 권한은 `PermissionGate`와 `usePermission`을 함께 사용합니다.

```tsx
const { canAccessMenu } = usePermission();
```

충전소 수정 버튼:

```tsx
<PermissionGate
  allow={canAccessMenu("station-management", "write")}
  fallback={<button disabled>충전소 수정 불가</button>}
>
  <button>충전소 수정</button>
</PermissionGate>
```

내보내기 버튼:

```tsx
<PermissionGate
  allow={canAccessMenu("dashboard", "download")}
  fallback={<button disabled>내보내기 불가</button>}
>
  <button>내보내기</button>
</PermissionGate>
```

## 현재 데모 결과

현재 mock 데이터 기준:

- `dashboard`
  - `read/write/download: true`
  - 홈 라우트 접근 가능
  - 내보내기 버튼 표시
- `station-management`
  - `read/write/download: true`
  - 충전소 수정 버튼 표시
- `station-fee-management`
  - `read/write/download: false`
  - 접근 거부
- `emsp-corporate-join-management`
  - `read: true`
  - 법인회원 가입관리 라우트 접근 가능
- `emsp-corporate-payment-settlement`
  - `read/write/download: false`
  - 법인 결제/정산 라우트 접근 시 `/403`
- `emsp-member-info`
  - `read/write/download: false`
  - 회원정보 라우트 접근 시 `/403`
- `emsp-member-payment`
  - `read/write/download: false`
  - 회원 결제 라우트 접근 시 `/403`

## 새 화면 추가 방법

새 권한 화면을 추가할 때:

1. API 또는 `permissionMenuMock`에 새 메뉴 ID와 권한을 추가합니다.
2. `src/app/routes` 아래에 라우트 파일을 생성합니다.
3. 라우트 컴포넌트에서 page를 `PermissionRoute`로 감쌉니다.
4. `menuId`에는 권한 데이터의 메뉴 ID를 넣습니다.
5. 기본 조회 권한이면 `permissionKey`를 생략하고, 쓰기/다운로드 권한이면 명시합니다.
6. 페이지 내부 버튼/기능 권한은 `PermissionGate`로 처리합니다.

예시:

```tsx
import PermissionRoute from "@/app/routes/_guards/PermissionRoute";
import SomePage from "@/pages/some";

const SomeRoute = () => {
  return (
    <PermissionRoute menuId="some-menu-id">
      <SomePage />
    </PermissionRoute>
  );
};

export default SomeRoute;
```
