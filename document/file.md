# 파일 업로드 로직 정리

## 1. 기본 정책

파일 업로드는 아래 순서로 처리한다.

```text
파일 그룹 ID 발급
→ 파일별 업로드 서명 URL 발급
→ 실제 파일 업로드
→ 파일 추가/삭제
→ 최종 저장 시 남아있는 fileDtlId만 전달
```

---

## 2. 파일 그룹 ID 발급

```http
GET /v1/backoffice/files/group-id
```

파일 업로드 여부와 관계없이 `fileGroupId`는 **필수로 미리 발급**한다.

즉, 실제 첨부파일이 하나도 없더라도 `fileGroupId`는 발급되어 있어야 한다.

### 처리 흐름

```text
등록 화면 진입
    ↓
fileGroupId 발급
    ↓
프론트에서 보관
```

### 응답 예시

```json
{
  "trace": null,
  "code": "0000",
  "message": null,
  "data": "0RD6QGP5S6058"
}
```

```ts
const fileGroupId = response.data;
```

---

## 3. 파일 추가

사용자가 파일을 추가할 때마다 업로드 서명 URL 발급 API를 호출한다.

```http
POST /v1/backoffice/files/multiple/upload/urls
```

### 요청 예시

```json
[
  {
    "referenceType": "BOARD",
    "originalName": "guide.pdf",
    "contentType": "application/pdf",
    "fileSize": 102400
  }
]
```

### 응답 예시

```json
[
  {
    "fileDtlId": "854877514602219000",
    "uploadUrl": "signed-upload-url",
    "downloadUrl": "download-url"
  }
]
```

응답에서 중요한 값은 아래 두 개다.

- `uploadUrl`
  - 실제 파일 업로드에 사용
- `fileDtlId`
  - 최종 저장 시 사용할 파일 식별자
  - 프론트에서 보관

---

## 4. 실제 파일 업로드

발급받은 `uploadUrl`을 이용해 실제 파일을 업로드한다.

```text
Browser
   ↓
uploadUrl
   ↓
CloudFront / Storage
```

예시:

```ts
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type,
  },
});
```

실제 파일 바이너리는 최종 등록 API에 다시 전달하지 않는다.

---

## 5. 파일 추가 / 삭제

최종 저장 전까지 사용자는 파일을 자유롭게 추가하거나 삭제할 수 있다.

예를 들어 파일 3개를 업로드한 경우:

```text
A.pdf → fileDtlId: A
B.pdf → fileDtlId: B
C.pdf → fileDtlId: C
```

프론트 상태:

```ts
[
  { fileDtlId: 'A' },
  { fileDtlId: 'B' },
  { fileDtlId: 'C' },
]
```

여기서 사용자가 `B.pdf`를 삭제하면:

```ts
[
  { fileDtlId: 'A' },
  { fileDtlId: 'C' },
]
```

삭제된 `B`는 최종 저장 대상에서 제외한다.

즉, 프론트에서는 **현재 최종 저장 대상 파일 목록만 관리**하면 된다.

---

## 6. 최종 저장

최종 등록/수정 시에는 업로드 서명 URL 발급 API에서 받은 `fileDtlId` 중 **현재 화면에 남아있는 파일의 ID만 전달**한다.

### 요청 예시

```json
{
  "title": "string",
  "publishType": "PUBLISHED",
  "publishStartAt": "2026-05-17T15:30:00Z",
  "publishEndAt": "2026-05-17T15:30:00Z",
  "thumbnailFileId": "0HZX3M5Q8J1KS",
  "landingUrl": "string",
  "fileConfirm": {
    "groups": [
      {
        "fileId": "0RD6QGP5S6058",
        "referenceType": "BOARD",
        "fileDtlIds": [
          "FILE_DTL_ID_1",
          "FILE_DTL_ID_2"
        ]
      }
    ]
  }
}
```

각 값의 의미는 다음과 같다.

```text
fileId
→ 최초 발급받은 fileGroupId

referenceType
→ 해당 업무의 파일 구분값

fileDtlIds
→ 최종 저장 대상 파일들의 fileDtlId
```

---

## 7. 파일이 없는 경우

파일이 하나도 없어도 `fileGroupId`는 발급한다.

최종 저장 시 `fileDtlIds`는 빈 배열로 전달한다.

```json
{
  "fileConfirm": {
    "groups": [
      {
        "fileId": "0RD6QGP5S6058",
        "referenceType": "BOARD",
        "fileDtlIds": []
      }
    ]
  }
}
```

즉,

```text
fileGroupId = 필수
fileDtlIds = 빈 배열 가능
```

---

## 8. 전체 예시

### 1) 등록 화면 진입

```http
GET /v1/backoffice/files/group-id
```

응답:

```text
fileGroupId = GROUP-001
```

---

### 2) A.pdf 추가

업로드 서명 URL 발급:

```http
POST /v1/backoffice/files/multiple/upload/urls
```

응답:

```text
fileDtlId = DETAIL-A
uploadUrl = URL-A
```

`URL-A`를 이용해 실제 파일을 업로드한다.

현재 상태:

```ts
[
  {
    fileDtlId: 'DETAIL-A',
  },
]
```

---

### 3) B.pdf 추가

업로드 서명 URL 발급 API를 다시 호출한다.

응답:

```text
fileDtlId = DETAIL-B
```

현재 상태:

```ts
[
  {
    fileDtlId: 'DETAIL-A',
  },
  {
    fileDtlId: 'DETAIL-B',
  },
]
```

---

### 4) A.pdf 삭제

현재 상태:

```ts
[
  {
    fileDtlId: 'DETAIL-B',
  },
]
```

---

### 5) C.pdf 추가

업로드 서명 URL 발급 API를 다시 호출한다.

응답:

```text
fileDtlId = DETAIL-C
```

현재 상태:

```ts
[
  {
    fileDtlId: 'DETAIL-B',
  },
  {
    fileDtlId: 'DETAIL-C',
  },
]
```

---

### 6) 최종 저장

```json
{
  "fileConfirm": {
    "groups": [
      {
        "fileId": "GROUP-001",
        "referenceType": "BOARD",
        "fileDtlIds": [
          "DETAIL-B",
          "DETAIL-C"
        ]
      }
    ]
  }
}
```

중간에 삭제한 `DETAIL-A`는 최종 저장 요청에 포함하지 않는다.

---

## 9. 프론트 상태 관리 예시

```ts
type UploadFile = {
  fileDtlId: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  downloadUrl?: string;
};

type FileUploadState = {
  fileGroupId: string;
  files: UploadFile[];
};
```

최종 저장 시:

```ts
const fileDtlIds = files.map((file) => file.fileDtlId);
```

```ts
const request = {
  ...formData,
  fileConfirm: {
    groups: [
      {
        fileId: fileGroupId,
        referenceType: 'BOARD',
        fileDtlIds,
      },
    ],
  },
};
```

---

## 10. 최종 정리

```text
1. fileGroupId는 무조건 먼저 발급
   - 파일이 없어도 필수

2. 파일 추가할 때마다
   업로드 서명 URL 발급 API 호출

3. 응답으로 받은 uploadUrl로 실제 파일 업로드

4. 응답으로 받은 fileDtlId는 프론트에서 관리

5. 저장 전까지 파일 추가/삭제는 자유롭게 처리

6. 삭제된 파일의 fileDtlId는 최종 저장 대상에서 제외

7. 최종 등록/수정 시
   현재 남아있는 파일의 fileDtlId만
   fileConfirm.groups[].fileDtlIds에 담아서 전달
```

> `fileGroupId`는 처음에 무조건 발급하고, 파일마다 `fileDtlId`를 발급받아 관리한 뒤, 최종 저장 시 남아있는 파일의 `fileDtlId`만 확정해서 전달한다.



# 파일 업로드 공통화 설계

## 1. 결론

파일 업로드 기능은 각 화면에서 개별적으로 구현하지 않고 **공통 로직으로 분리해서 사용하는 방향**으로 구성한다.

다만 파일 업로드 컴포넌트 내부에서 화면의 등록/수정 API까지 처리하지 않는다.

권장 구조는 다음과 같다.

```text
공통 Hook
+
공통 FileUpload UI
+
각 화면의 최종 저장 처리
```

즉, 역할을 아래와 같이 구분한다.

```text
[각 화면]
- 화면 Form 데이터 관리
- 게시글 / 공지사항 / 배너 등 업무 API 호출
- fileConfirm 최종 조립

        ↓

[useFileUpload]
- fileGroupId 발급
- 업로드 서명 URL 발급
- 실제 파일 업로드
- fileDtlId 관리
- 파일 추가 / 삭제
- 최종 파일 목록 제공

        ↓

[FileUpload Component]
- 파일 선택
- 파일 목록 표시
- 삭제 UI
- 업로드 상태 표시

        ↓

[File API]
- 그룹 ID 발급 API
- 업로드 서명 URL 발급 API
```

---

## 2. 공통화가 필요한 이유

현재 파일 업로드 정책상 모든 파일 첨부 화면에서 공통적으로 아래 과정이 필요하다.

```text
1. fileGroupId 발급
2. 파일 선택
3. 업로드 서명 URL 발급
4. uploadUrl을 이용한 실제 파일 업로드
5. fileDtlId 관리
6. 파일 추가 / 삭제
7. 최종 저장 대상 fileDtlId 관리
```

이 로직을 각 화면에서 직접 구현할 경우 동일한 코드가 반복된다.

예를 들어 파일을 사용하는 화면이 다음과 같이 늘어난다면,

```text
공지사항
배너
게시판
약관
팝업
자료실
```

각 화면마다 동일하게 아래 처리가 필요해진다.

```ts
const fileGroupId = await getFileGroupId();

const uploadInfo = await getUploadUrls(files);

await uploadFile(uploadInfo.uploadUrl, file);

setFiles(...);
```

이 경우 파일 정책이나 API가 변경되었을 때 모든 화면을 수정해야 한다.

따라서 파일 자체의 생명주기는 공통 영역에서 처리하는 것이 적절하다.

---

## 3. 공통 영역과 화면 영역 구분

### 공통에서 처리

```text
fileGroupId 발급
업로드 서명 URL 발급
실제 파일 업로드
fileDtlId 관리
파일 추가
파일 삭제
업로드 진행 상태
업로드 실패 처리
최종 파일 목록 제공
```

### 각 화면에서 처리

```text
화면 Form 데이터
업무별 validation
등록 / 수정 API
fileConfirm 조립
최종 Submit
```

즉, 파일 공통 모듈은 게시판, 공지사항, 배너 등의 업무를 알 필요가 없다.

---

## 4. 권장 구조

```text
shared/
└─ file/
   ├─ api/
   │  └─ file-api.ts
   │
   ├─ hooks/
   │  └─ use-file-upload.ts
   │
   ├─ ui/
   │  └─ file-upload.tsx
   │
   └─ model/
      └─ file-upload.type.ts
```

역할은 다음과 같다.

### `file-api.ts`

파일 관련 API만 담당한다.

```text
파일 그룹 ID 발급
업로드 서명 URL 발급
```

### `use-file-upload.ts`

파일 업로드 비즈니스 로직을 담당한다.

```text
fileGroupId 관리
서명 URL 발급
실제 업로드
파일 상태 관리
삭제
fileDtlId 관리
```

### `file-upload.tsx`

UI만 담당한다.

```text
파일 선택
파일명 표시
용량 표시
삭제 버튼
업로드 상태 표시
```

---

## 5. 파일 Group ID 처리

파일이 없어도 `fileGroupId`는 필수이므로 파일 업로드 기능을 사용하는 화면에서는 최초에 반드시 그룹 ID를 발급한다.

```http
GET /v1/backoffice/files/group-id
```

예를 들어 `useFileUpload` 내부에서 자동 발급하도록 처리할 수 있다.

```ts
const {
  data: fileGroupId,
} = useFileGroupIdQuery();
```

또는 필요한 시점에 직접 발급한다.

중요한 것은 각 화면 개발자가 `fileGroupId` 발급 여부를 신경 쓰지 않도록 공통 로직에서 보장하는 것이다.

```text
파일 없음
→ fileGroupId 발급 O

파일 있음
→ fileGroupId 발급 O
```

---

## 6. 파일 업로드 Hook 역할

예상 사용 형태는 다음과 같다.

```ts
const {
  fileGroupId,
  files,
  uploadFiles,
  removeFile,
  isUploading,
} = useFileUpload({
  referenceType: 'BOARD',
});
```

각 값의 역할:

### `fileGroupId`

최초 발급받은 파일 그룹 ID.

```ts
fileGroupId;
```

### `files`

현재 최종 저장 대상 파일 목록.

```ts
files;
```

예:

```ts
[
  {
    fileDtlId: 'DETAIL-A',
    originalName: 'a.pdf',
  },
  {
    fileDtlId: 'DETAIL-B',
    originalName: 'b.pdf',
  },
]
```

### `uploadFiles`

파일 선택 후 업로드 전체 과정을 처리한다.

```text
파일 선택
→ 서명 URL 발급
→ 실제 파일 PUT
→ 성공한 fileDtlId를 files에 추가
```

### `removeFile`

현재 최종 저장 대상에서 해당 파일을 제거한다.

```ts
removeFile(fileDtlId);
```

### `isUploading`

파일 업로드 진행 중 여부.

최종 저장 버튼 제어 등에 사용할 수 있다.

```tsx
<Button
  disabled={isUploading}
>
  저장
</Button>
```

---

## 7. FileUpload UI 역할

UI 컴포넌트에서는 API 상세 구현을 알 필요가 없다.

예:

```tsx
<FileUpload
  files={files}
  onUpload={uploadFiles}
  onRemove={removeFile}
  isUploading={isUploading}
/>
```

FileUpload는 다음만 담당한다.

```text
파일 선택
파일 Drag & Drop
파일 목록 출력
파일 삭제 버튼
업로드 상태 UI
```

파일 저장 API 또는 게시판 저장 API 등은 알지 않는다.

---

## 8. 최종 저장은 각 화면에서 처리

공통 파일 업로드 로직에서 업무 데이터의 최종 저장까지 처리하지 않는다.

예를 들어 게시판 등록 화면이라면 게시판 화면에서 최종 Request를 생성한다.

```ts
const handleSubmit = async (
  formData: BoardFormData,
) => {
  const fileDtlIds = files.map(
    (file) => file.fileDtlId,
  );

  await createBoard({
    ...formData,

    fileConfirm: {
      groups: [
        {
          fileId: fileGroupId,
          referenceType: 'BOARD',
          fileDtlIds,
        },
      ],
    },
  });
};
```

즉,

```text
useFileUpload
→ 최종 파일 상태까지만 관리

Board Page
→ fileConfirm 생성
→ createBoard 호출
```

형태로 역할을 분리한다.

---

## 9. 컴포넌트 하나에 모든 로직을 넣지 않는 이유

다음과 같은 구조도 만들 수 있다.

```tsx
<FileUpload
  referenceType="BOARD"
/>
```

그리고 내부에서

```text
groupId 발급
서명 URL 발급
파일 업로드
상태관리
```

까지 모두 처리할 수 있다.

하지만 파일 로직과 UI가 하나로 강하게 묶인다.

향후 다음과 같이 UI가 달라질 가능성이 있다.

```text
일반 파일 첨부
이미지 첨부
썸네일 첨부
Drag & Drop 전용
단일 파일
다중 파일
AG Grid 내부 파일 첨부
```

따라서 다음과 같이 분리하는 것이 더 재사용하기 좋다.

```tsx
const fileUpload = useFileUpload({
  referenceType: 'BOARD',
});

<FileUpload {...fileUpload} />
```

동일한 Hook을 사용하면서 UI만 변경할 수 있다.

예:

```tsx
<ImageUpload {...fileUpload} />
```

또는

```tsx
<ThumbnailUpload {...fileUpload} />
```

---

## 10. 파일 추가/삭제 처리

예를 들어 사용자가 다음 파일을 업로드했다고 가정한다.

```text
A.pdf → DETAIL-A
B.pdf → DETAIL-B
C.pdf → DETAIL-C
```

상태:

```ts
files = [
  {
    fileDtlId: 'DETAIL-A',
  },
  {
    fileDtlId: 'DETAIL-B',
  },
  {
    fileDtlId: 'DETAIL-C',
  },
];
```

사용자가 `B.pdf`를 삭제한다.

```ts
removeFile('DETAIL-B');
```

결과:

```ts
files = [
  {
    fileDtlId: 'DETAIL-A',
  },
  {
    fileDtlId: 'DETAIL-C',
  },
];
```

최종 저장 시에는 현재 `files`에 존재하는 값만 사용한다.

```ts
const fileDtlIds = files.map(
  ({ fileDtlId }) => fileDtlId,
);
```

결과:

```ts
[
  'DETAIL-A',
  'DETAIL-C',
]
```

---

## 11. 최종 데이터 흐름

```text
화면 진입
    ↓
useFileUpload()
    ↓
fileGroupId 발급
    ↓
GROUP-001

사용자 파일 선택
    ↓
uploadFiles()
    ↓
업로드 서명 URL 발급
    ↓
fileDtlId + uploadUrl
    ↓
uploadUrl로 실제 파일 PUT
    ↓
files에 fileDtlId 추가

사용자 파일 삭제
    ↓
files에서 해당 fileDtlId 제거

사용자 최종 저장
    ↓
현재 files의 fileDtlId 추출
    ↓
fileConfirm 생성
    ↓
업무 등록 / 수정 API 호출
```

---

## 12. 최종 권장 방향

### 각 화면에서 파일 로직을 직접 구현

```text
권장하지 않음
```

이유:

- 중복 코드 증가
- `fileGroupId` 발급 누락 가능
- 파일 정책 변경 시 모든 화면 수정 필요
- 업로드 실패 처리 중복
- 파일 상태 관리 방식이 화면마다 달라질 가능성

---

### FileUpload 컴포넌트 하나에 모든 로직 구현

```text
일부 가능하지만 권장하지 않음
```

이유:

- UI와 API 로직 결합
- 다른 형태의 파일 UI 재사용 어려움
- 컴포넌트 역할이 커짐

---

### 공통 Hook + UI Component 분리

```text
권장
```

구조:

```text
useFileUpload
    ↓
파일 관련 로직 담당

FileUpload
    ↓
파일 관련 UI 담당

각 화면
    ↓
최종 업무 저장 담당
```

---

## 13. 최종 역할 정리

```text
┌──────────────────────────────────────┐
│              각 화면                 │
│                                      │
│ - Form 데이터                        │
│ - 업무 Validation                    │
│ - fileConfirm 조립                   │
│ - 등록 / 수정 API 호출               │
└──────────────────┬───────────────────┘
                   │
                   │ files / fileGroupId
                   │
┌──────────────────▼───────────────────┐
│            useFileUpload              │
│                                      │
│ - fileGroupId 발급                   │
│ - 서명 URL 발급                      │
│ - 실제 파일 Upload                   │
│ - fileDtlId 관리                     │
│ - 추가 / 삭제                        │
│ - Upload 상태 관리                   │
└──────────────────┬───────────────────┘
                   │
┌──────────────────▼───────────────────┐
│              FileUpload               │
│                                      │
│ - 파일 선택 UI                       │
│ - 파일 목록                          │
│ - 삭제 버튼                          │
│ - 업로드 상태                        │
└──────────────────────────────────────┘
```

## 최종 결론

파일 업로드 자체의 생명주기는 공통화한다.

```text
fileGroupId 발급
→ 업로드 서명 URL 발급
→ 실제 파일 업로드
→ fileDtlId 관리
→ 파일 추가/삭제
```

위 영역은 `useFileUpload`에서 담당한다.

UI는 `FileUpload` 컴포넌트로 분리한다.

각 화면에서는 공통 파일 모듈에서 제공하는

```text
fileGroupId
files
```

를 사용하여 최종 `fileConfirm`을 구성하고 업무 등록/수정 API를 호출한다.

따라서 최종 구조는 다음과 같이 가져가는 것을 권장한다.

```text
공통 File API
+
공통 useFileUpload Hook
+
공통 FileUpload UI
+
각 화면의 최종 Submit
```