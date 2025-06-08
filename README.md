# EasyMemo - PWA 메모장 애플리케이션

간단하고 직관적인 PWA(Progressive Web App) 메모장 애플리케이션입니다.

## 프로젝트 구조

```
easymemo/
├── frontend/          # Next.js PWA 프론트엔드
│   ├── public/       # 정적 파일
│   └── src/         # 소스 코드
└── backend/          # Express.js 백엔드
    └── src/         # 소스 코드
```

## 기술 스택

### 프론트엔드
- Next.js 14
- TypeScript
- PWA (next-pwa)
- Zustand (상태 관리)

### 백엔드
- Express.js
- TypeScript
- MongoDB

## 시작하기

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

### 백엔드
```bash
cd backend
npm install
npm run dev
```

## 주요 기능

### 1. 메모 관리
- 메모 작성
- 메모 목록 조회
- 메모 삭제
- 실시간 저장

### 2. PWA 기능
- 오프라인 지원
- 홈 화면 설치
- 앱 아이콘
- 전체 화면 모드

## 라이선스

MIT License 