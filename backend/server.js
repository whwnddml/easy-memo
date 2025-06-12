require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 모델 import
const User = require('./models/User');
const Memo = require('./models/Memo');

const app = express();

// CORS 설정
app.use(cors({
  origin: ['https://whwnddml.github.io', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// JSON 파싱 미들웨어
app.use(express.json());

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    const MONGODB_USER = process.env.MONGODB_USER || 'admin';
    const MONGODB_PASSWORD = encodeURIComponent(process.env.MONGODB_PASSWORD);
    const MONGODB_HOST = process.env.MONGODB_HOST || '172.18.0.2';
    const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
    const MONGODB_DB = process.env.MONGODB_DB || 'easymemo';
    
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

// 인증 미들웨어 import
const { authenticateToken } = require('./middleware/auth');

// 라우터 등록
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// 에러 핸들러 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('에러 발생:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params
  });
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

// 메모 목록 조회 (JWT 인증 필요, 페이징 지원)
app.get('/api/memos', authenticateToken, async (req, res, next) => {
  try {
    // JWT 토큰에서 추출한 사용자 ID 사용
    const userId = req.userId;
    
    // 페이징 파라미터
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // 메모 조회 쿼리 생성
    const query = { userId };

    // 메모 조회 (페이징 적용)
    const [memos, totalCount] = await Promise.all([
      Memo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('content createdAt updatedAt')
        .lean(),
      Memo.countDocuments(query)
    ]);

    // 페이징 정보 계산
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // 응답 데이터 구성
    res.json({
      memos: memos.map(memo => ({
        _id: memo._id,
        content: memo.content,
        createdAt: memo.createdAt,
        updatedAt: memo.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
});

// 메모 생성 (JWT 인증 필요)
app.post('/api/memos', authenticateToken, async (req, res, next) => {
  try {
    // JWT 토큰에서 추출한 사용자 ID 사용
    const userId = req.userId;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '메모 내용은 필수입니다' });
    }
    
    const memo = new Memo({
      userId,
      content: content.trim()
    });
    const savedMemo = await memo.save();
    res.status(201).json(savedMemo);
  } catch (error) {
    next(error);
  }
});

// 메모 삭제 (JWT 인증 필요)
app.delete('/api/memos/:id', authenticateToken, async (req, res, next) => {
  try {
    // JWT 토큰에서 추출한 사용자 ID 사용
    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '잘못된 메모 ID입니다' });
    }
    
    const deletedMemo = await Memo.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedMemo) {
      return res.status(404).json({ message: '메모를 찾을 수 없습니다' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 메모 수정 (JWT 인증 필요)
app.put('/api/memos/:id', authenticateToken, async (req, res, next) => {
  try {
    // JWT 토큰에서 추출한 사용자 ID 사용
    const userId = req.userId;
    const { content } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: '잘못된 메모 ID입니다' });
    }
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '메모 내용은 필수입니다' });
    }
    
    const updatedMemo = await Memo.findOneAndUpdate(
      { _id: req.params.id, userId },
      { content: content.trim(), updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedMemo) {
      return res.status(404).json({ message: '메모를 찾을 수 없습니다' });
    }
    res.json(updatedMemo);
  } catch (error) {
    next(error);
  }
});

// 에러 핸들러 등록
app.use(errorHandler);

// 서버 시작
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log('GitHub Actions 배포 테스트 성공! ');
  console.log('Admin Emails:', process.env.ADMIN_EMAILS);
}); 