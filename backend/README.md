# EasyMemo Backend

간단하고 직관적인 온라인 메모 애플리케이션의 백엔드 서버입니다.

## 주요 기능

- 메모 CRUD API 제공
- MongoDB 데이터 저장
- RESTful API 설계

## 기술 스택

- Node.js
- Express
- MongoDB
- Mongoose

## 시작하기

1. MongoDB 설치 및 실행
```bash
# MongoDB가 설치되어 있어야 합니다
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 서버 확인
```
http://localhost:5000
```

## API 엔드포인트

- GET /api/memos: 메모 목록 조회
- POST /api/memos: 새 메모 생성
- DELETE /api/memos/:id: 메모 삭제 