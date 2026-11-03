# 게시글 HTML Stored XSS 수정

## 원인과 반영 범위

HTML 소스 모드의 `onChange`가 원문을 폼에 전달해, 일반 편집기로 돌아가지 않고 저장하면 `<img onerror=...>` 같은 이벤트 핸들러가 요청에 포함될 수 있었다.

- `src/shared/ui/editor/lib/tiptapDesignedHtml.ts`: DOMPurify 기반 태그·속성 허용 목록을 적용한다. 이벤트 핸들러, 스크립트, SVG/MathML, 폼, 임베드 요소, 실행 가능한 URL을 제거한다. 기존 CSS 정제도 이스케이프와 레거시 실행 속성을 차단하도록 보강했다.
- `TiptapEditor`: 초기 값, 외부 값 변경, 붙여넣기, 소스 모드 전환, 모든 `onChange` 출력에 정제를 적용한다. 입력 중인 원문은 textarea 내부에만 보관한다.
- `TiptapViewer`: 기존 공통 정제 함수 호출을 통해 이미 저장된 HTML에도 같은 정책을 적용한다.

각 화면과 API 함수에는 별도 정제를 추가하지 않는다. 입력은 `TiptapEditor`의 `onChange` 값을 사용하고, HTML 출력은 `TiptapViewer`를 사용하면 공통 정책이 적용된다. HTML 정제 함수는 에디터 내부에서 관리한다.

본문의 이미지, 표, 글자 서식, 안전한 링크와 `data-file-detail-id`는 유지한다. 버튼 이동은 안전한 `data-href`로 지정하며 인라인 JavaScript는 허용하지 않는다.

## 검증

```sh
pnpm exec vitest run src/shared/ui/editor
```

26개 테스트로 보고된 `img onerror` 입력, 소스 모드 즉시 저장/붙여넣기, 기존 값 로딩, 일반 편집기 붙여넣기, 뷰어, URL 우회, SVG/MathML, 정상 서식 보존을 검증한다. 변경 파일 ESLint도 통과했다.

전체 `pnpm run tsc`는 기존의 누락 모듈·타입 오류로 실패한다. 수정 전후 진단을 비교했으며 이번 변경으로 추가된 오류는 없다. 운영 API 및 사용자 앱에 대한 재진단은 수행하지 않았다.

## 별도 저장소·운영 환경에서 필요한 조치

프런트엔드 정제는 직접 API 요청으로 우회할 수 있으므로 이 수정만으로 서버의 Stored XSS 조치를 완료 처리하면 안 된다.

1. `/v1/backoffice/pfmt/notice/notices` 등록/수정과 동일한 HTML 저장 API에서 서버용 HTML sanitizer로 허용 목록 정제를 적용한다. 정제 결과를 저장하고, 정제 후 비어 있는 필수 본문을 검증한다. 정규식만으로 HTML을 검증하지 않는다.
2. 사용자 앱의 공지 상세 등 HTML 출력 지점에서도 정제한다. 현재 저장소의 `TiptapViewer` 변경은 별도 사용자 앱에 자동 적용되지 않는다.
3. 기존 저장 데이터와 캐시에 대해서도 읽기 시 정제 또는 검토된 데이터 정리 작업을 적용한다. 이번 작업에서는 운영 데이터에 접근하거나 변경하지 않았다.
4. 사용자 앱/관리자 페이지의 응답 헤더에 CSP를 적용해 인라인 스크립트와 이벤트 핸들러를 차단한다. 실제 스크립트 출처와 nonce/hash 구성을 확인한 뒤 적용하며, `script-src-attr 'none'`과 `object-src 'none'` 등을 포함해 검증한다. 배포 서버 설정은 이 저장소에 없어 변경하지 않았다.
5. 브라우저 에디터를 거치지 않은 직접 API 요청과 기존 악성 게시글 조회를 포함해 운영과 동일한 환경에서 재진단한다.

정책 참고: [DOMPurify 공식 문서](https://github.com/cure53/DOMPurify), [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).
