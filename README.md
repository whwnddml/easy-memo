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
└── backend/          # Express.js 백엔드
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

## 라이선스

MIT License 