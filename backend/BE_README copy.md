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
http://localhost:3008
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


#몽고DB 실행을 위한 컨테이너 실행.
docker run --name easymemo-mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=@4the9817 \
  -v /volume1/docker2/mongodb/data:/data/db \
  -p 27017:27017 \
  mongo:4.4.18

.env
 MONGODB_URI=mongodb://admin:@4the9817@[시놀로지_IP]:27017


docker run -d --name easymemo-mongodb --network easymemo-network -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD="@4the9817" mongo:4.4.18 --bind_ip 0.0.0.0

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

------------------------------------------------------------------
-- 직접 명령으로 실행.
------------------------------------------------------------------
docker run -d \
  --name easymemo-backend \
  --network easymemo-network \
  -p 3007:3005 \
  -v /volume1/docker2/easymemo-backend:/app:rw \
  --env-file /volume1/docker2/easymemo-backend/.env \
  node:18 \
  sh -c "cd /app && npm install && node server.js"


  docker network connect easymemo-network easymemo-mongodb

chmod 644 docker-compose.yml
sudo chown -R eworks:users .git
chmod -R u+rwX .git
sudo usermod -aG docker eworks

chown root:administrators /var/run/docker.sock
chmod 660 /var/run/docker.sock

ls -l /var/run/docker.sock

------------------------------------------------------------------
-- docker-compose-all.yml => 미완성
------------------------------------------------------------------
version: '3.8'

services:
  backend:
    image: node:18.20.8 # 필요시 backend 이미지를 빌드하려면 build 옵션 사용
    container_name: easymemo-backend
    working_dir: /app
    volumes:
      - /volume1/docker2/easymemo-backend:/app
    ports:
      - 3007:3005
    environment:
      MONGODB_USER: ${MONGODB_USER}
      MONGODB_PASSWORD: ${MONGODB_PASSWORD}
      MONGODB_HOST: ${MONGODB_HOST}
      MONGODB_PORT: ${MONGODB_PORT}
      MONGODB_DB: ${MONGODB_DB}
      NODE_VERSION: ${NODE_VERSION:-18.20.8}
      YARN_VERSION: ${YARN_VERSION:-1.22.22}
    command: sh -c "cd /app && npm install && node server.js"
    networks:
      - easymemo-network

  mongo:
    image: mongo:6.0
    container_name: easymemo-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGODB_DB}
    volumes:
      - /volume1/docker2/easymemo-mongodb:/data/db
    ports:
      - 27017:27017
    networks:
      - easymemo-network

networks:
  easymemo-network:
    driver: bridge



------------------------------------------------------------------
-- docker-compose.yml
------------------------------------------------------------------
version: '3.8'

services:
  backend:
    image: node:18.20.8 # 필요시 backend 이미지를 빌드하려면 build 옵션 사용
    container_name: easymemo-backend
    working_dir: /app
    volumes:
      - /volume1/docker2/easymemo-backend:/app
    ports:
      - 3007:3005
    command: sh -c "cd /app && npm install && node server.js"
    env_file:
      - /volume1/docker2/easymemo-backend/.env
    networks:
      - easymemo-network

networks:
  easymemo-network:
    external: true      # 이미 만든 네트워크 쓸 때 추가!
    name: easymemo-network



MONGODB_USER=admin
MONGODB_PASSWORD=@4the9817
MONGODB_HOST=mongo
MONGODB_PORT=27017
MONGODB_DB=easymemo    