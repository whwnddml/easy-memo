# EasyMemo Backend

간단하고 직관적인 온라인 메모 애플리케이션의 백엔드 서버입니다.

## 주요 기능

### 1. API 엔드포인트
- `GET /api/memos`: 메모 목록 조회 (시간순 정렬)
- `POST /api/memos`: 새 메모 생성
- `DELETE /api/memos/:id`: 메모 삭제
- `HEAD /api/memos`: 서버 상태 확인

### 2. 데이터베이스
- MongoDB를 사용한 메모 데이터 저장
- 자동 타임스탬프 (생성일, 수정일)
- 데이터 유효성 검사

### 3. 보안 기능
- CORS 설정
- 요청 유효성 검사
- 에러 처리 미들웨어

## 기술 스택

- Node.js
- Express
- MongoDB
- Mongoose
- Docker

## 시스템 요구사항

- Node.js 18 이상
- Docker
- MongoDB 4.4 이상

## 설치 및 실행

### Docker를 사용한 설치

1. MongoDB 컨테이너 실행
```bash
docker run -d --name easymemo-mongodb \
  --network easymemo-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD="비밀번호" \
  mongo:4.4.18 --bind_ip 0.0.0.0
```

2. 백엔드 서버 컨테이너 실행
```bash
docker run -d --name easymemo-backend \
  --network easymemo-network \
  -p 3008:3005 \
  -v $(pwd):/app \
  -w /app \
  node:18 npm start
```

### 로컬 개발 환경

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
# .env 파일 생성
MONGODB_URI=mongodb://admin:비밀번호@localhost:27017/easymemo?authSource=admin
PORT=3005
```

3. 개발 서버 실행
```bash
npm run dev
```

## API 명세

### GET /api/memos
- 설명: 전체 메모 목록 조회
- 응답: 메모 객체 배열
```json
[
  {
    "_id": "메모ID",
    "content": "메모 내용",
    "createdAt": "생성일시",
    "updatedAt": "수정일시"
  }
]
```

### POST /api/memos
- 설명: 새 메모 생성
- 요청 본문:
```json
{
  "content": "메모 내용"
}
```
- 응답: 생성된 메모 객체

### DELETE /api/memos/:id
- 설명: 메모 삭제
- 응답: 204 No Content

### HEAD /api/memos
- 설명: 서버 상태 확인
- 응답: 200 OK 또는 503 Service Unavailable

## 데이터베이스 스키마

### Memo
```javascript
{
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    required: true
  }
}
```

## 에러 처리

- 400: 잘못된 요청
- 404: 리소스 없음
- 500: 서버 내부 오류

## 보안 설정

### CORS 설정
- 허용된 오리진
- Credentials 지원
- 허용된 메서드
- 허용된 헤더

### MongoDB 보안
- 인증 필수
- 네트워크 접근 제한
- 데이터베이스 사용자 권한 관리