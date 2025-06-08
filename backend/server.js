require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS 설정
app.use(cors({
  origin: ['https://whwnddml.github.io', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// JSON 파싱 미들웨어
app.use(express.json());

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    const MONGODB_USER = 'admin';
    const MONGODB_PASSWORD = encodeURIComponent('Kumis94@27');
    const MONGODB_HOST = '172.18.0.2';
    const MONGODB_PORT = '27017';
    const MONGODB_DB = 'easymemo';
    
    const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=admin`;
    
    console.log('MongoDB 연결 시도:', MONGODB_URI.replace(MONGODB_PASSWORD, '****'));
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB 연결 성공');

    // 연결 성공 후에만 이벤트 리스너 등록
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다...');
        setTimeout(connectDB, 5000);
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB 연결 에러:', err);
        mongoose.connection.close();
      });
    }

  } catch (err) {
    console.error('MongoDB 연결 실패:', err);
    setTimeout(connectDB, 5000);
  }
};

// 초기 MongoDB 연결
connectDB();

// 메모 스키마 정의
const memoSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: [true, '메모 내용은 필수입니다'] 
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
});

// 저장 전 updatedAt 필드 업데이트
memoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Memo = mongoose.model('Memo', memoSchema);

// 에러 핸들러 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('에러 발생:', err);
  res.status(err.status || 500).json({
    message: err.message || '서버 내부 오류가 발생했습니다'
  });
};

// API 엔드포인트
// 헬스 체크
app.head('/api/memos', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).end();
  } else {
    res.status(503).end();
  }
});

// 메모 목록 조회
app.get('/api/memos', async (req, res, next) => {
  try {
    const memos = await Memo.find()
      .sort({ createdAt: -1 })
      .select('content createdAt updatedAt');
    res.json(memos);
  } catch (error) {
    next(error);
  }
});

// 메모 생성
app.post('/api/memos', async (req, res, next) => {
  try {
    if (!req.body.content || req.body.content.trim() === '') {
      return res.status(400).json({ message: '메모 내용은 필수입니다' });
    }

    const memo = new Memo({
      content: req.body.content.trim()
    });
    
    const savedMemo = await memo.save();
    res.status(201).json(savedMemo);
  } catch (error) {
    next(error);
  }
});

// 메모 삭제
app.delete('/api/memos/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '잘못된 메모 ID입니다' });
    }

    const deletedMemo = await Memo.findByIdAndDelete(req.params.id);
    if (!deletedMemo) {
      return res.status(404).json({ message: '메모를 찾을 수 없습니다' });
    }
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 에러 핸들러 등록
app.use(errorHandler);

// 서버 시작
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
}); 