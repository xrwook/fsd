# FSD Test (React Router + Tailwind)

이 프로젝트는 React Router 기반 앱을 Feature-Sliced Design(FSD) 구조로 시작할 수 있도록 구성한 예제입니다.

## FSD 레이어

- app: 앱 부트스트랩, 전역 스타일, 라우팅 엔트리
- pages: 라우트 단위 화면 조합
- widgets: 재사용 가능한 화면 블록
- features: 사용자 시나리오 중심 기능
- entities: 도메인 엔티티 모델/표현
- shared: 공통 UI, 유틸, 설정, 에셋

현재 홈 화면은 pages -> widgets -> shared 순으로 의존하도록 구성되어 있습니다.

## 현재 구조

```text
app/
	root.tsx
	routes.ts
	routes/
		home.tsx
	pages/
		home/
			index.tsx
			ui/
				HomePage.tsx
	widgets/
		welcome/
			index.ts
			ui/
				WelcomeWidget.tsx
	shared/
		assets/
			react-router/
				logo-dark.svg
				logo-light.svg
```

## Getting Started

### Installation

의존성 설치:

```bash
pnpm install
```

### Development

개발 서버 실행:

```bash
pnpm dev
```

브라우저에서 http://localhost:5173 으로 접속합니다.

## Building for Production

프로덕션 빌드:

```bash
pnpm build
```

## 타입 체크

```bash
pnpm typecheck
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## 다음 확장 가이드

- 새 화면은 pages 레이어에 생성하고, 화면 블록은 widgets로 분리
- 비즈니스 액션(예: 로그인, 좋아요 토글)은 features에 배치
- 도메인 데이터 타입/모델은 entities에 배치
- 공통 컴포넌트/유틸/상수는 shared로 집약
