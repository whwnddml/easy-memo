# EasyMemo - PWA 메모장 애플리케이션

간단하고 직관적인 PWA(Progressive Web App) 메모장 애플리케이션입니다.

## 배포 URL
- 프론트엔드: https://whwnddml.github.io/easy-memo/
- 백엔드: https://junny.dyndns.org:3008/api

## 시스템 아키텍처

```mermaid
graph TD
    A[GitHub Pages] -->|호스팅| B[프론트엔드<br/>Next.js PWA]
    B -->|API 요청| C[백엔드<br/>Express.js]
    C -->|데이터 저장| D[MongoDB<br/>Docker]
    E[사용자] -->|접속| A
    B -->|오프라인 저장| F[로컬 스토리지]
```

## 주요 기능

### 1. 메모 관리
- 메모 작성 및 실시간 저장
- 메모 목록 조회 (시간순 정렬)
- 메모 삭제
- 오프라인 작동 지원
- 자동 동기화

### 2. 기술적 특징
- PWA (Progressive Web App)
- 반응형 디자인
- REST API
- Docker 컨테이너화
- GitHub Actions 자동 배포

## 프로젝트 구조

```
easymemo/
├── frontend/          # Next.js PWA 프론트엔드
│   ├── public/       # 정적 파일
│   └── src/         # 소스 코드
└── backend/          # Node.js, Express.js 백엔드
    └── src/         # 소스 코드
```

## 기술 스택

### 프론트엔드
- Next.js 14
- TypeScript
- Zustand (상태 관리)
- PWA 지원

### 백엔드
- Express.js
- MongoDB
- Docker
- Mongoose

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

### Docker 컨테이너
```bash
# MongoDB 실행
docker run -d --name easymemo-mongodb \
  --network easymemo-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD="비밀번호" \
  mongo:4.4.18 --bind_ip 0.0.0.0

# 백엔드 실행
docker run -d --name easymemo-backend \
  --network easymemo-network \
  -p 3008:3005 \
  -v $(pwd)/backend:/app \
  -w /app \
  node:18 npm start
```

## 배포

### 프론트엔드
- GitHub Pages 자동 배포
- GitHub Actions 워크플로우

### 백엔드
- Synology NAS Docker
- MongoDB 컨테이너
- Node.js 백엔드 컨테이너

## 환경 변수

### 프론트엔드
```env
NEXT_PUBLIC_API_URL=https://junny.dyndns.org:3008/api
NEXT_PUBLIC_BASE_PATH=/easy-memo
```

### 백엔드
```env
MONGODB_URI=mongodb://admin:비밀번호@localhost:27017/easymemo?authSource=admin
PORT=3005
```

## 변경 이력 관리

이 프로젝트는 체계적인 변경 이력 관리를 위해 자동화된 CHANGELOG 시스템을 사용합니다.

### 자동 CHANGELOG 업데이트

#### 설정 방법
```bash
# Git hooks 설정 (최초 1회만)
chmod +x scripts/setup-git-hooks.sh
./scripts/setup-git-hooks.sh
```

#### 사용 방법
```bash
# 수동으로 CHANGELOG 업데이트
npm run update-changelog

# 버전 태그와 함께 릴리스
npm run release

# 특정 버전으로 업데이트
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0  
npm run version:major   # 1.0.0 → 2.0.0
```

#### 커밋 메시지 규칙
변경사항이 자동으로 올바르게 분류되도록 다음 규칙을 따라주세요:

```bash
# 새로운 기능
feat: add user authentication
feat(memo): implement memo sharing feature

# 버그 수정
fix: resolve memo deletion bug
fix(auth): fix login token expiration

# 기능 변경
change: update memo list UI
update: improve mobile responsiveness

# 기능 제거
remove: delete deprecated API endpoint
delete: remove unused components

# 문서 업데이트
docs: update README
docs(changelog): add version 1.2.0
```

#### 자동 분류 시스템
- **Added**: `feat`, `add`, `feature`, `implement`, `create`
- **Changed**: `change`, `update`, `refactor`, `modify`
- **Fixed**: `fix`, `bugfix`, `resolve`, `bug`
- **Removed**: `remove`, `delete`
- **Security**: `security`, `sec`

### CHANGELOG.md 구조
- **[Unreleased]**: 다음 릴리스 예정 변경사항
- **[버전] - 날짜**: 각 버전별 변경사항
- **카테고리별 정리**: Added, Changed, Fixed, Removed, Security

### Git Hooks
Git push 시 자동으로 CHANGELOG.md가 업데이트됩니다:
1. 마지막 태그 이후의 커밋 메시지 분석
2. 변경 유형별로 자동 분류
3. CHANGELOG.md에 새 버전 섹션 추가
4. 선택적으로 Git 태그 생성

더 자세한 내용은 [CHANGELOG.md](./CHANGELOG.md)를 참고하세요.

## 라이선스

MIT License 