# 공통 탭 이동 처리 수정

실제 수정 파일: src/app/providers/navigation-provider/NavigationInitializer.tsx

배너 전용 SCREEN_ID, PLATFORMMGT, isBannerList 조건을 제거했습니다.

## 공통 판단 기준

- screenPathMap으로 등록된 URL을 matchRoutes로 매칭합니다. 정적 경로와 동적 경로가 겹쳐도 라우터의 경로 우선순위를 사용합니다.
- extraPageRoutes의 parentScreenId로 상세/등록/수정 화면이 어느 메뉴에 속하는지 판단합니다.
- 같은 메뉴 안에서 이동하면 쿼리를 유지합니다.
- 다른 메뉴에서 들어오면 모든 쿼리 파라미터를 제거하고 현재 기록을 replace합니다. 브라우저 뒤로가기/앞으로가기에도 적용됩니다.
- 기본 탭 값은 각 화면에서 정합니다. 공통 코드에 QRAUTH 같은 화면별 기본값을 넣지 않습니다.

## 쿼리 초기화 범위

TAB_QUERY_KEYS를 제거했습니다. 다른 메뉴에서 이동하면 search를 빈 문자열로 교체하므로 탭, 검색 조건, 페이지 번호 등 모든 쿼리 파라미터가 제거됩니다. 일반 메뉴 이동으로 명시적으로 전달한 쿼리도 동일하게 제거됩니다.

hash와 state는 유지합니다. 같은 메뉴의 상세 화면에서 복귀하거나, 직접 URL로 처음 접속하거나 새로고침하면 URL의 쿼리를 유지합니다.

## 각 화면에서 유지할 수정

탭 전환은 방문 기록을 추가하지 않도록 처리합니다.

```tsx
setSearchParam({ position: value }, { replace: true });
```

위 코드는 기존 배너 화면의 호출 예시입니다. 다른 화면은 실제 사용하는 쿼리 키와 기존 파라미터 유지 방식을 그대로 사용하고 replace 옵션을 추가합니다.

## 적용 전제

NavigationInitializer는 Router 안에서 페이지 이동 중에도 마운트 상태를 유지해야 합니다. 목록은 메뉴 경로에, 상세/등록/수정 화면은 extraPageRoutes의 parentScreenId에 올바르게 등록되어 있어야 같은 메뉴로 판별됩니다.

현재 구현은 하위 화면의 parentScreenId가 해당 메뉴를 가리키는 기존 라우트 구조를 따릅니다. useEffect에서 URL을 교체하므로 교체 전 URL로 한 번 렌더링되거나 조회될 수 있습니다.
