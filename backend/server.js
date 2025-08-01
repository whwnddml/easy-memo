require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { FRONTEND_URL } = require('./config');

// 서버 배포용 테스트 작업.

// 모델 import
const User = require('./models/User');
const Memo = require('./models/Memo');

const app = express();

// CORS 설정
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['https://whwnddml.github.io', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// 모든 OPTIONS 요청에 대해 CORS 허용
app.options('*', cors(corsOptions));

// 일반 요청에 대한 CORS 적용
app.use(cors(corsOptions));

/*
// 추가 CORS 헤더 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://whwnddml.github.io');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONS 요청에 대한 즉시 응답
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});
*/

// JSON 파싱 미들웨어
app.use(express.json());

// MongoDB 연결 함수
const connectDB = async () => {
  try {
    const MONGODB_USER = process.env.MONGODB_USER || 'admin';
    const MONGODB_PASSWORD = encodeURIComponent(process.env.MONGODB_PASSWORD);
    const MONGODB_HOST = process.env.MONGODB_HOST || 'easymemo-mongodb';
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
      authSource: 'admin'
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




// 토큰 없이 패스워드 초기화
app.post('/api/users/reset-password-direct', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: '이메일과 새 패스워드는 필수입니다.' });
  }

  try {
    // 사용자 검색
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 새 패스워드 해싱
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 패스워드 업데이트
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: '패스워드가 성공적으로 초기화되었습니다.' });
  } catch (error) {
    console.error('패스워드 초기화 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 초기화 요청 엔드포인트 추가
app.post('/api/users/password-reset-request', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: '이메일은 필수입니다.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 초기화 토큰 생성
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const tokenExpiry = Date.now() + 3600000; // 1시간 후 만료

    // 사용자 데이터베이스에 토큰 저장
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    // 이메일 전송
    const transporter = nodemailer.createTransport({
      host: 'smtp.naver.com',
      port: 587,
      secure: false, // true 일 경우 465, false 일 경우 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // 디버깅 로그 활성화
      debug: true,  // 디버깅 활성화
    });
    
    // 이메일 내용 작성
    const resetLink = `${FRONTEND_URL}/password-reset?token=${resetToken}&email=${email}`;
    await transporter.sendMail({
      from: `"EasyMemo" <${process.env.EMAIL_USER}>`, // 발신자 이메일
      to: email,
      subject: '패스워드 초기화 요청',
      text: `다음 링크를 클릭하여 패스워드를 초기화하세요: ${resetLink}`,
    });

    res.status(200).json({ message: '패스워드 초기화 이메일이 전송되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 요청 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 패스워드 업데이트 엔드포인트 추가
app.post('/api/users/password-reset', async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    // 필수 필드 확인
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }
    // 사용자 검색
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 토큰 검증
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
    }

    // 패스워드 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: '패스워드가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 재설정 중 오류 발생:', error);
    next(error);
  }
});

// API 엔드포인트
// 헬스 체크
app.get('/api/health', (req, res) => {
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'error';
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

// 기존 HEAD 메서드 헬스 체크도 유지
app.head('/api/health', (req, res) => {
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
    
    // 페이징 파라미터 (기본값: 10개씩)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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