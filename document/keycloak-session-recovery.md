# Keycloak 세션 만료 처리 적용 안내

현재 fsd-test에 수정했습니다. 변경한 소스에서 `수정: 세션 만료 처리`를 검색하면 적용 지점을 찾을 수 있습니다.

사진으로 확인한 처리상의 빈틈을 보완한 수정입니다. 실제 내부망의 실패 응답과 SDK 버전은 확인하지 못했으므로, 내부망 증상의 원인이 모두 해결됐다고 확정할 수는 없습니다. 특히 사진의 keycloak.ts는 loginKeycloak 중간에서 끝나므로 나머지 구현과 비교가 필요합니다.

## 변경 이유

- 기존 Axios 응답 인터셉터는 401도 그대로 reject하고, 공통 분류기는 이를 접근 오류로 처리합니다. Keycloak 활성화 시 401은 로그인 이동을 먼저 시작하도록 변경했습니다.
- 요청 직전 토큰 갱신이 실패하면 일반 예외가 일시적 오류 페이지로 이어질 수 있습니다. 로그인 복구를 시도한 뒤 해당 API를 Axios CanceledError로 중단합니다.
- 로그인 이동으로 취소한 요청을 공통 오류 분류와 Query 재시도에서 제외했습니다. Promise는 실패 상태로 종료되며, 성공 응답을 만들어내거나 API를 자동 재전송하지 않습니다.
- check-sso에서는 onAuthLogout에서 이동 표시만 켜면 후속 loginKeycloak이 중복 방지 조건에 막힐 수 있습니다. 이 경우에는 직접 loginKeycloak을 호출합니다.
- 403, 일반 API 네트워크 오류, 500 등의 기존 처리는 유지합니다. 토큰 갱신 실패 시 로그인 복구를 시도하는 기존 정책을 따릅니다. 갱신 실패가 항상 세션 만료를 의미하는 것은 아닙니다.

## 파일 대응표와 적용 순서

| 순서 | fsd-test의 수정 파일 | 내부망 사진의 대응 파일 |
| --- | --- | --- |
| 1 | src/shared/lib/keycloak/keycloak.ts | 같은 경로 |
| 2 | src/app/providers/keycloak-provider/index.tsx | src/app/providers/KeycloakProvider.tsx |
| 3 | src/shared/lib/api/axiosInstance.ts | 같은 경로 |
| 4 | src/shared/lib/api-error/index.ts | src/shared/lib/api/error.ts |
| 5 | src/app/providers/query-provider/index.tsx | QueryClient를 생성하는 Provider 파일 |

내부망은 환경 변수, 이름, 업무 코드가 다르므로 파일 전체를 덮어쓰지 말고 아래 함수와 조건만 옮깁니다. 테스트 파일은 내부망 동작에 필수는 아닙니다.

### 1. keycloak.ts

사진의 initializeKeycloak에 있는 빈 `.catch(() => { ... })`를 제거합니다. fsd-test는 이미 오류를 전달하고 있어 이 부분에는 설명 주석만 추가했습니다. 초기화 실패를 undefined로 바꾸면 Provider가 정상적인 미인증 상태로 오해합니다.

```ts
let initKeycloak: Promise<boolean> | null = null;

// initializeKeycloak 내부
initKeycloak ??= keycloak.init(getInitOptions());
return initKeycloak;
```

사진의 변수명에 맞춘 loginKeycloak 교체 내용입니다. 사진에 보이지 않는 뒷부분에 별도 로그인 옵션이 있다면 기존 옵션을 유지합니다.

```ts
export const loginKeycloak = async () => {
  const keycloak = getKeycloakInstance();
  if (!keycloak) return;

  // 수정: 세션 만료 처리 - 동시 호출도 같은 로그인 결과를 기다립니다.
  if (loginKeycloakReq) return loginKeycloakReq;
  if (keycloakRedirect) return;

  keycloakRedirect = true;
  try {
    loginKeycloakReq = keycloak.login();
    await loginKeycloakReq;
  } catch (error) {
    keycloakRedirect = false;
    loginKeycloakReq = null;
    throw error;
  }
};
```

아래 함수가 없다면 추가하고 `keycloak/index.ts`에서도 export합니다. Axios에서 Keycloak 비활성화 환경을 구별하는 데 사용합니다.

```ts
export const isKeycloakEnabled = () => KEYCLOAK_INFO.enabled;
```

### 2. KeycloakProvider.tsx

사진의 86행 부근 `onAuthLogout`을 아래처럼 교체합니다. 내부망의 설정 이름은 사진대로 `KEYCLOAK_INFO.onload`를 사용합니다.

```ts
keycloak.onAuthLogout = () => {
  // 수정: 세션 만료 처리
  if (KEYCLOAK_INFO.onload === 'login-required') {
    // 이 모드의 clearToken에서는 SDK가 이어서 login을 호출합니다.
    markKeycloakRedirect();
  } else {
    // 먼저 markKeycloakRedirect()를 호출하면 loginKeycloak이 막힙니다.
    loginKeycloak().catch(handleLoginRecoveryError);
  }
};
```

onTokenExpired와 onAuthRefreshError는 사진처럼 로그인 복구 흐름을 유지합니다. 초기화 오류를 처리하는 setErrorState까지 일괄 제거하지 않습니다.

### 3. axiosInstance.ts

fsd-test의 이 파일에서 `redirectToLoginAndCancel` 함수, 요청 인터셉터의 토큰 취득 부분, 응답 인터셉터의 401 조건을 함께 옮깁니다.

사진의 내부망 이름과 다른 import는 아래처럼 별칭을 주면 수정 코드를 그대로 참고할 수 있습니다.

```ts
import axios, { CanceledError } from 'axios';
import {
  getKeycloakAccessToken,
  isKeycloakEnabled,
  isKeycloakRedirect as isKeycloakRedirecting,
  loginKeycloak,
} from '@/shared/lib/keycloak';
```

기존 baseURL, paramsSerializer, 화면 ID 헤더 처리는 유지합니다. 요청 인터셉터의 `const accessToken = await ...` 한 줄을 fsd-test의 토큰 취득/취소 블록으로 교체합니다. 응답 인터셉터의 error 타입은 `unknown`으로 두고 `axios.isAxiosError(error)`로 확인합니다.

401 조건에 403을 추가하지 않습니다. 내부망에서 세션 만료를 별도 업무 코드나 403으로 반환한다면, 실제 응답을 보고 그 만료 조건만 별도로 구별해야 합니다.

### 4. api/error.ts — 반드시 함께 적용

import에 isCancel을 추가하고, classifyApiError의 **첫 번째 조건**, 즉 `!isAxiosError(error)` 검사보다 위에 다음 내용을 추가합니다.

```ts
import { isAxiosError, isCancel } from 'axios';

// classifyApiError 내부 맨 위
// 수정: 세션 만료 처리 - 로그인 이동으로 중단한 요청은 오류 화면을 띄우지 않습니다.
if (isCancel(error)) {
  return null;
}
```

이 조건을 빠뜨리면 CanceledError가 status 없는 Axios 오류로 분류되어 networkError 화면으로 갈 수 있습니다. 내부망의 MAIN_INFO_ERROR_STATUS, 400 업무 코드 처리, 502 예외 정책은 그대로 둡니다.

### 5. QueryClient Provider

`defaultOptions.queries.retry`에 다음 조건을 적용합니다. 아래 숫자 1은 fsd-test의 기존 재시도 횟수입니다. 내부망 재시도 정책이 다르면 취소 제외 조건만 기존 정책에 결합합니다.

```ts
import { isCancel } from 'axios';

// defaultOptions.queries
retry: (failureCount, error) => !isCancel(error) && failureCount < 1,
```

사진의 AppAccessGuard에는 이미 로그인 이동 중 오류 페이지 이동을 막는 조건이 있으므로 이번에 별도로 수정하지 않았습니다. api/index.ts와 Query의 onError가 공통 classifyApiError를 사용하면 4번 수정이 함께 적용됩니다. 화면별 catch에서 직접 오류 페이지 이동이나 알림을 띄운다면, 그곳에서도 `isCancel(error)`인 경우를 제외합니다.

## 내부망 확인 순서

1. 로그인 후 Keycloak 세션을 만료시키고 API를 호출합니다. 오류 페이지를 거치지 않고 로그인 화면으로 이동하는지 확인합니다.
2. 세션 만료 상태에서 여러 API가 동시에 실행돼도 로그인 요청이 중복 발생하지 않는지 확인합니다.
3. 토큰 만료 후 갱신 가능한 세션은 갱신되어 정상 요청되는지 확인합니다. Access Token 만료와 Keycloak 세션 종료는 다릅니다.
4. 정상 로그인 상태의 권한 부족 403은 기존 접근 오류 화면으로, 일반 API 500/네트워크 오류는 기존 오류 화면으로 가는지 확인합니다.
5. 인증 서버 자체의 로그인 시작이 실패하면 오류가 취소로 숨겨지지 않는지 확인합니다.

이 변경은 앱의 공통 오류 페이지로 잘못 이동하는 경로를 다룹니다. Keycloak 서버 자체의 error 화면이라면 해당 화면 문구와 실패 요청을 추가 확인해야 합니다. 로그인 후에도 정상 토큰으로 계속 401이 반환되면 백엔드의 토큰 검증/클라이언트 설정도 확인해야 합니다.

참고: [Keycloak JavaScript adapter 공식 문서](https://www.keycloak.org/securing-apps/javascript-adapter)의 updateToken, onLoad, 인증 이벤트 설명. 자동 로그인 호출 순서는 이 프로젝트에 설치된 keycloak-js의 clearToken 구현도 확인했습니다.

## 로컬 검증 결과

- 새 세션 복구/Provider 테스트와 기존 AppAccessGuard 테스트: 3개 파일, 25개 테스트 통과. 인증 서버와 API 전송은 모의 객체로 검증했습니다.
- 변경 TypeScript 파일 ESLint 검사 및 git diff 공백 검사 완료.
- 전체 타입 검사는 기존 사내 패키지 누락 등으로 실패합니다. TypeScript 컴파일러로 수정 전 HEAD 소스와 현재 소스를 비교했으며, 두 경우 모두 오류 282개로 이번 변경에서 추가된 진단은 없습니다.
- 실제 내부망 Keycloak 서버와 브라우저 로그인 이동은 위 확인 순서에 따라 별도 검증해야 합니다.
