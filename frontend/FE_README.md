# EasyMemo - PWA 메모장 애플리케이션

간단하고 직관적인 PWA(Progressive Web App) 메모장 애플리케이션입니다.

## 배포 URL
https://whwnddml.github.io/easy-memo/

## 주요 기능

### 1. 메모 관리
- 메모 작성 및 실시간 저장
- 메모 목록 조회 (시간순 정렬)
- 메모 삭제
- 오프라인 작동 지원
- 자동 동기화

### 2. PWA 기능
- 오프라인 지원
- 홈 화면 설치
- 앱 아이콘
- 전체 화면 모드

### 3. 데이터 동기화
- 온라인/오프라인 상태 자동 감지
- 오프라인에서 작성된 메모 자동 동기화
- 실시간 서버 연결 상태 확인
- 안정적인 데이터 처리

## 기술 스택

### 프레임워크 & 라이브러리
- Next.js 14
- TypeScript
- Zustand (상태 관리)
- PWA 지원

### API & 통신
- REST API 통신
- CORS 설정
- 자동 재시도 메커니즘
- 에러 처리

### 스타일링
- CSS Modules
- 반응형 디자인
- 모던한 UI/UX

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 정적 파일 생성
npm run export
```

## 프로젝트 구조

```
frontend/
├── public/
│   ├── icons/          # PWA 아이콘
│   └── manifest.json   # PWA 설정
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── MemoForm.tsx    # 메모 입력 폼
│   │   │   └── MemoList.tsx    # 메모 목록 표시
│   │   ├── store/
│   │   │   └── memoStore.ts    # Zustand 상태 관리
│   │   ├── globals.css         # 전역 스타일
│   │   ├── layout.tsx          # 앱 레이아웃
│   │   └── page.tsx            # 메인 페이지
│   └── types/                  # 타입 정의
├── next.config.js              # Next.js 설정
└── package.json
```

## 주요 구현 사항

### 1. 상태 관리 (memoStore)
- Zustand를 사용한 전역 상태 관리
- 메모 CRUD 작업 처리
- 온라인/오프라인 상태 관리
- 자동 동기화 로직

### 2. 오프라인 지원
- 오프라인 상태에서 메모 작성 가능
- 네트워크 복구 시 자동 동기화
- 로컬 스토리지를 활용한 데이터 유지

### 3. 에러 처리
- 네트워크 오류 처리
- 사용자 피드백 제공
- 자동 재시도 메커니즘

### 4. 보안
- CORS 설정
- 인증 처리
- 안전한 API 통신

## 배포

GitHub Actions를 통한 자동 배포:
1. main 브랜치에 push
2. 자동 빌드 및 테스트
3. GitHub Pages에 배포

## 환경 설정

프로젝트 실행을 위한 환경 변수:
- `NEXT_PUBLIC_API_URL`: 백엔드 API 주소
- `NEXT_PUBLIC_BASE_PATH`: GitHub Pages 배포 경로 