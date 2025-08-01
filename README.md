# EasyMemo - PWA 메모장 애플리케이션

간단하고 직관적인 PWA(Progressive Web App) 메모장 애플리케이션입니다.

## 배포 URL
- 프론트엔드: https://whwnddml.github.io/easy-memo/
- 백엔드: https://junny.dyndns.org:3008/api

## 시스템 아키텍처

```mermaid
graph TD
    A[사용자] -->|접속| B[GitHub Pages<br/>whwnddml.github.io]
    B -->|API 요청| C[공유기<br/>Port:3008]
    C -->|포트포워딩| D[시놀로지 NAS<br/>nginx:3008->3007]
    D -->|프록시| E[백엔드 컨테이너<br/>Port:3007->3005]
    E -->|내부 네트워크| F[MongoDB 컨테이너<br/>easymemo-mongodb:27017]
    B -->|오프라인 저장| G[로컬 스토리지]
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

### 개발 환경 (Local)

1. 환경변수 설정

프론트엔드 (`frontend/.env.development`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3005/api
```

백엔드 (`backend/.env.development`):
```env
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=비밀번호
MONGODB_DB=easymemo
PORT=3005
```

2. MongoDB 실행
```bash
docker run -d --name easymemo-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD="비밀번호" \
  mongo:4.4.18 --bind_ip 0.0.0.0
```

3. 백엔드 실행
```bash
cd backend
npm install
npm run dev
```

4. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 프로덕션 환경 (Production)

1. 환경변수 설정

프론트엔드 (`frontend/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://junny.dyndns.org:3008/api
NEXT_PUBLIC_BASE_PATH=/easy-memo
```

백엔드 (`backend/.env.production`):
```env
MONGODB_HOST=easymeno-mongodb
MONGODB_PORT=27017
MONGODB_USER=admin
MONGODB_PASSWORD=비밀번호
MONGODB_DB=easymemo
PORT=3005
```

2. Docker 컨테이너 실행 (Synology NAS)

MongoDB 컨테이너:
```bash
docker run -d --name easymemo-mongodb \
  --network easymemo-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD="비밀번호" \
  mongo:4.4.18 --bind_ip 0.0.0.0
```

백엔드 컨테이너:
```bash
docker run -d --name easymemo-backend \
  --network easymemo-network \
  -p 3007:3005 \
  -v $(pwd)/backend:/app \
  -w /app \
  node:18 npm start
```

3. nginx 설정 (Synology NAS)
```nginx
location /api {
    proxy_pass http://localhost:3007;
    
    # 프록시 헤더
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS 설정
    add_header 'Access-Control-Allow-Origin' 'https://whwnddml.github.io' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Accept, Origin, X-Requested-With, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    # OPTIONS 요청 처리
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://whwnddml.github.io' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Accept, Origin, X-Requested-With, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

4. 공유기 포트포워딩 설정
- 외부 포트: 3008
- 내부 IP: 시놀로지 NAS IP
- 내부 포트: 3008

## 배포

### 프론트엔드
- GitHub Pages 자동 배포
- GitHub Actions 워크플로우

### 백엔드
- Synology NAS Docker
- MongoDB 컨테이너
- Node.js 백엔드 컨테이너
- GitHub Actions 워크플로우

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

### 시놀로지 NAS 권한 문제 해결

#### 문제
- Docker 데몬 소켓(`/var/run/docker.sock`)에 접근하려고 할 때 `permission denied` 오류 발생.

#### 원인
- SSH로 접속한 사용자가 Docker 그룹에 속해 있지 않음.

#### 해결 방법
1. SSH로 접속한 사용자를 Docker 그룹에 추가:
   ```bash
   sudo usermod -aG docker <username>


2. Docker 소켓 권한 확인 및 수정:
   ```bash
   ls -l /var/run/docker.sock
   sudo chmod 660 /var/run/docker.sock

3. SSH 세션을 종료하고 다시 로그인하여 변경 사항 적용.
