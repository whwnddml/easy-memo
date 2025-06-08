# EasyMemo - PWA 메모장 애플리케이션

간단하고 직관적인 PWA(Progressive Web App) 메모장 애플리케이션입니다.

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

### 3. 캐시 전략
- 정적 자산 (StaleWhileRevalidate)
  - 이미지, 폰트, CSS, JS 파일
  - 24시간 캐시 유지
- API 요청 (NetworkFirst)
  - 10초 타임아웃
  - 24시간 캐시 유지
- 폰트 (CacheFirst)
  - 1년 캐시 유지

## 기술 스택

- Next.js 14
- TypeScript
- PWA (next-pwa)
- Zustand (상태 관리)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## PWA 설치 방법

1. Chrome 브라우저
   - 주소창 오른쪽의 설치 아이콘 클릭
   - "EasyMemo 설치" 선택

2. 모바일 브라우저
   - "홈 화면에 추가" 옵션 선택
   - 앱 아이콘으로 실행

## 프로젝트 구조

```
frontend/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── icon.svg
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── MemoForm.tsx
│   │   │   └── MemoList.tsx
│   │   ├── store/
│   │   │   └── memoStore.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── ...
├── next.config.js
└── package.json
```

## 오프라인 지원

- 인터넷 연결이 없어도 메모 작성 가능
- 오프라인에서 작성한 메모는 자동으로 동기화
- 정적 자산은 캐시되어 오프라인에서도 접근 가능

## 앱 아이콘

- 192x192 크기 (작은 아이콘)
- 512x512 크기 (큰 아이콘)
- 둥근 모서리와 메모지 디자인
- 파란색 배경에 흰색 메모지

## 라이선스

MIT License 