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


-------------------------------------------
컨테이너 이름: easymemo-mongodb
이미지: mongo:latest
포트 설정:
  - 로컬 포트: 27017
  - 컨테이너 포트: 27017
환경 변수:
  - MONGODB_INITDB_ROOT_USERNAME: [원하는 사용자명]
  - MONGODB_INITDB_ROOT_PASSWORD: [안전한 비밀번호]
볼륨 설정:
  - /volume1/docker/mongodb/data:/data/db
  - /volume1/docker/mongodb/config:/data/configdb


  admin
  K**9**

docker rm easymemo-mongodb

docker run --name easymemo-mongodb \
-e MONGODB_INITDB_ROOT_USERNAME=admin \
-e MONGODB_INITDB_ROOT_PASSWORD=Kumis94@27 \
-v /volume1/docker2/mongodb/data:/data/db \
-p 27017:27017 \
mongodb/mongodb-community-server:latest




docker run --name easymemo-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=Kumis94@27 \
  -v /volume1/docker2/mongodb/data:/data/db \
  -p 27017:27017 \
  mongo:4.4.18

.env
 MONGODB_URI=mongodb://admin:Kumis94@27@[시놀로지_IP]:27017


docker run -d --name easymemo-mongodb --network easymemo-network -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD="Kumis94@27" mongo:4.4.18 --bind_ip 0.0.0.0

docker run -d --name easymemo-backend --network easymemo-network -p 3007:3005 -v $(pwd)/../backend:/app -w /app node:18 npm start


root@SynoDS:~# docker exec -it easymemo-mongodb mongo -u admin -p 'Kumis94@27'
MongoDB shell version v4.4.18
connecting to: mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb
Error: Authentication failed. :
connect@src/mongo/shell/mongo.js:374:17
@(connect):2:6
exception: connect failed
exiting with code 1
root@SynoDS:~# 

docker exec -it easymemo-mongodb mongo -u admin -p 'Kumis94@27' --authenticationDatabase admin


docker stop easymemo-backend
docker rm easymemo-backend

docker run -d \
  --name easymemo-backend \
  --network easymemo-network \
  -p 3007:3005 \
  -v /volume1/docker2/easymemo-backend:/app:rw \
  node:18 \
  sh -c "cd /app && npm install && node server.js"


  docker network connect easymemo-network easymemo-mongodb