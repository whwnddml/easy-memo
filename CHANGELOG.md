# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-01-12

### Added
- 로그인 우선 플로우 구현
- 헤더 UI에 사용자 정보 및 로그아웃 버튼 추가
- 모바일 반응형 헤더 스타일
- 메모 스토어에 `clearMemos` 함수 추가

### Changed
- 메인 페이지가 로그인 상태에 따라 다른 콘텐츠 표시
- 로그인하지 않은 경우 로그인 폼 우선 표시
- 로그인 후 메모 목록과 작성 폼 표시
- 로그아웃 시 메모 데이터 자동 초기화

### Removed
- 게스트 모드 옵션 제거 (로그인 필수)
- 로그인 폼에서 "게스트로 이용하기" 버튼 제거

### Fixed
- 빌드 오류 수정: `getUserId` import 제거
- MemoForm, MemoList 컴포넌트의 타입 오류 수정

## [1.1.0] - 2025-01-12

### Fixed
- `getUserId` 함수 export 누락으로 인한 빌드 오류 수정
- MemoForm에서 불필요한 매개변수 제거
- MemoList에서 타입 불일치 오류 수정
- `isHydrated` 관련 코드 정리

### Changed
- MemoForm UI 개선 (로딩 상태 표시, 스타일링)
- 메모 추가 시 필요한 데이터만 전송하도록 최적화

## [1.0.0] - 2025-01-12

### Added
- **이중 저장 시스템 구현**
  - 게스트 모드: 브라우저 localStorage 사용
  - 인증 모드: MongoDB 서버 저장
- **JWT 기반 인증 시스템**
  - 이메일/패스워드 로그인
  - 토큰 자동 검증
  - 7일 만료 토큰
- **사용자 관리**
  - User 모델: 이메일, 소셜 로그인 지원
  - bcrypt 패스워드 해싱
  - 소셜 로그인 준비 (구글, 페이스북, 카카오, 네이버)
- **메모 관리 시스템**
  - Memo 모델: 사용자별 메모 분리
  - CRUD 작업 (생성, 읽기, 수정, 삭제)
  - 실시간 UI 업데이트
- **Zustand 상태 관리**
  - 인증 상태 관리 (authStore)
  - 메모 상태 관리 (memoStore)
  - 브라우저 새로고침 시 상태 유지
- **UI/UX 개선**
  - 현대적이고 깔끔한 디자인
  - 모바일 반응형 레이아웃
  - 로딩 상태 표시
  - 에러 처리 및 사용자 피드백

### Technical
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT, bcrypt
- **State Management**: Zustand with persistence
- **Deployment**: GitHub Pages (Frontend), Custom Server (Backend)
- **Database**: MongoDB with Mongoose ODM

### Security
- 패스워드 bcrypt 해싱
- JWT 토큰 기반 인증
- CORS 설정
- 환경 변수를 통한 민감 정보 관리

### Infrastructure
- GitHub Actions 자동 배포
- 프론트엔드와 백엔드 분리된 구조
- HTTPS 지원

## Initial Release

### Added
- 기본 메모 애플리케이션 구조
- Next.js 프론트엔드 설정
- Express 백엔드 서버 설정
- MongoDB 데이터베이스 연동

---

## 버전 관리 규칙

### 버전 번호 체계 (Semantic Versioning)
- **MAJOR.MINOR.PATCH** (예: 1.2.0)
- **MAJOR**: 호환되지 않는 API 변경
- **MINOR**: 하위 호환되는 새로운 기능 추가
- **PATCH**: 하위 호환되는 버그 수정

### 변경 유형
- **Added**: 새로운 기능
- **Changed**: 기존 기능의 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련 수정

### 커밋 메시지 규칙
```
type(scope): description

예시:
feat(auth): add JWT authentication
fix(memo): resolve memo deletion bug
docs(changelog): update version 1.2.0
```

### 릴리스 프로세스
1. 기능 개발 및 테스트
2. CHANGELOG.md 업데이트
3. 버전 태그 생성: `git tag v1.2.0`
4. 코드 푸시: `git push origin main --tags`
5. GitHub에서 릴리스 노트 작성 