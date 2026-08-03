# Notice Pattern Guide Prompt

다음에 퍼블된 화면을 실제 동작 코드로 다시 만들 때 사용하는 가이드 프롬프트입니다.  
퍼블 코드는 UI 참고용으로만 보고, 내부 구조와 로직은 반드시 Notice 구현을 기준으로 다시 작성합니다.

## Copy Prompt

```md
hec-pjt에서 [기능명]을 Notice 패턴 기준으로 다시 구현해줘.

아래 자료를 기준으로 작업해줘.

- 퍼블된 코드/이미지: UI 모양과 화면 구성만 참고
- Swagger/API 이미지: 실제 API path, method, request, response 기준
- 기획 이미지는 없으면 합리적으로 Notice UX를 따라가기

반드시 지켜야 할 기준:

- `hec-pjt/pages/service/notice` 구현을 우선 참고한다.
- 퍼블된 코드의 내부 상태, 더미 데이터, 임시 로직은 그대로 가져오지 않는다.
- import alias나 외부 패키지 해석 문제는 신경 쓰지 말고 기존 Notice 작성 스타일에 맞춘다.
- FSD 구조는 Notice처럼 정리한다.
- 같은 화면에서 쓰는 API는 너무 잘게 쪼개지 말고 화면 단위로 통합한다.
- query key는 `hec-pjt/serviceKeys.ts`의 `serviceKeys`에서 중앙 관리한다.
- query parameter가 2개 이상인 조회 API는 hook/queryOptions factory를 만들되, query key는 반드시 `serviceKeys.[domain].*`를 사용한다.
- 등록/수정이 같은 폼을 쓰면 `features/[기능명]-form`으로 공통 폼을 분리한다.
- 등록/수정 페이지 또는 모달은 `react-hook-form`과 zod resolver를 사용한다.
- filter는 Notice list filter처럼 `FormProvider` + `useFormContext`를 사용한다.
- filter 컴포넌트에 모든 데이터를 props로 넘기지 않는다. 필요한 props는 `onReset`, `setFilter` 정도로 제한한다.
- table 영역, filter 영역, toolbar 영역은 Notice list처럼 분리한다.
- 각 화면 폴더는 자기 `ui` 폴더를 가진다.
- 저장/수정/삭제 성공 후 관련 query invalidate를 적용한다.

Notice 참고 파일:

- `hec-pjt/pages/service/notice/notice-list/ui/NoticeListPage.tsx`
- `hec-pjt/pages/service/notice/notice-list/ui/_NoticeListFilter.tsx`
- `hec-pjt/pages/service/notice/notice-list/ui/_NoticeTable.tsx`
- `hec-pjt/pages/service/notice/notice-list/ui/_NoticeTableToolbar.tsx`
- `hec-pjt/pages/service/notice/notice-list/model/*`
- `hec-pjt/pages/service/notice/notice-list/api/noticeList.ts`
- `hec-pjt/pages/service/notice/notice-create/ui/NoticeCreatePage.tsx`
- `hec-pjt/pages/service/notice/notice-update/ui/NoticeUpdatePage.tsx`
- `hec-pjt/features/notice-form/*`

원하는 산출물:

- API 타입 및 hook
- `serviceKeys` query key
- hook/queryOptions factory
- list page
- list filter
- table
- table toolbar
- no rows overlay가 필요하면 Notice와 동일 패턴
- create/update 공통 form
- create 화면 또는 modal
- detail 화면 또는 modal
- update 화면 또는 modal
- delete flow
- category/display/order 같은 부가 화면이 있으면 화면별 폴더와 api
- index export 정리

작업 후 확인:

- dummy state/data 제거
- 퍼블 전용 mock 로직 제거
- Swagger request/response 필드명 반영
- Notice와 같은 `apiRequest`, `serviceKeys`, `navigateToScreen`, `PageLayout`, `DataGrid/DataTable`, `DynamicFilter` 사용 방식 유지
- API 파일 내부에서 `["domain-list"]` 같은 임시 query key를 만들지 않고 `serviceKeys.[domain].all/list/detail`만 사용
- formatter는 Notice처럼 `formatUtc`, `formatDateTime`, `toUtcStartOfDay`, `toUtcEndOfDay` 등을 사용
- mutation 성공 시 snackbar, navigate, invalidate 흐름 확인
- prettier 적용
```

## Structure Template

```txt
hec-pjt/features/[domain]-form/
  index.ts
  model/
    constant.ts
    [domain]Values.ts
    schema.ts
  ui/
    [Domain]Form.tsx

hec-pjt/pages/service/[domain]/
  index.ts
  [domain]-list/
    index.ts
    api/
      index.ts
      [domain]List.ts
    model/
      index.ts
      columnDefs.ts
      filter.ts
      [domain]List.ts
    ui/
      [Domain]List.tsx
      _[Domain]ListFilter.tsx
      _[Domain]Table.tsx
      _[Domain]TableToolbar.tsx
  [domain]-create/
    index.ts
    api/
      index.ts
      [domain]Create.ts
    ui/
      [Domain]CreatePage.tsx 또는 [Domain]CreateModal.tsx
  [domain]-detail/
    index.ts
    api/
      index.ts
      [domain]Detail.ts
    ui/
      [Domain]DetailPage.tsx 또는 _[Domain]DetailModal.tsx
  [domain]-update/
    index.ts
    api/
      index.ts
      [domain]Update.ts
    ui/
      [Domain]UpdatePage.tsx 또는 [Domain]UpdateModal.tsx
```

## Implementation Checklist

1. Swagger에서 API를 먼저 정리한다.
   - method/path
   - path/query/header/body
   - response data
   - version 필드 여부
   - 삭제/수정 동시성 처리 여부

2. Notice reference를 먼저 읽는다.
   - list page/filter/table/toolbar
   - create/update form
   - detail/delete flow
   - query key invalidate 방식

3. model을 만든다.
   - list item type
   - filter state/default state
   - columnDefs
   - status/badge constant
   - form values/default values/schema

4. API를 만든다.
   - 화면 단위로 파일을 묶는다.
   - query key는 `hec-pjt/serviceKeys.ts`의 `serviceKeys`에 먼저 추가한다.
   - query가 복수 조건이면 hook/queryOptions factory를 만들되 `queryKey`는 `serviceKeys.[domain].*`를 사용한다.
   - mutation 성공 시 관련 list/detail/category/display query를 invalidate한다.

### Query Key Management

Query key는 API 파일마다 새로 만들지 않고 `hec-pjt/serviceKeys.ts`에서 아래처럼 한 곳에서 관리한다.

```ts
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
} as const;
```

5. list를 Notice 방식으로 구성한다.
   - `useState(filter)`
   - `useForm({ defaultValues })`
   - `FormProvider`
   - filter 컴포넌트는 `useFormContext`
   - table과 toolbar 분리

6. create/update form은 공통화한다.
   - `features/[domain]-form/ui/[Domain]Form.tsx`
   - create/update는 같은 form에 default values만 다르게 주입한다.
   - 날짜는 submit 시 UTC 포맷으로 변환한다.
   - 예약 상태가 아니면 예약일을 null 처리한다.

7. 퍼블 코드에서 가져오면 안 되는 것.
   - dummy row data
   - 임시 snackbar state 남발
   - 화면 안에 API/폼/테이블 로직이 전부 섞인 구조
   - props drilling으로 filter 데이터를 전부 넘기는 구조
   - FSD와 맞지 않는 `@/pages/.../model/...` 식의 내부 참조

8. 완료 전 확인한다.
   - `rg`로 dummy/mock/TREE_ROW_DATA/console.log 검색
   - formatter 실행
   - 가능한 경우 typecheck 실행
   - alias/import 때문에 typecheck가 막히면 원인만 분리해서 보고

```

```
