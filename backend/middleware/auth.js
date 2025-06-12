const jwt = require('jsonwebtoken');

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '접근 토큰이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
      } else {
        return res.status(403).json({ message: '토큰 검증에 실패했습니다.' });
      }
    }

    // 토큰에서 추출한 사용자 ID를 req 객체에 추가
    req.userId = decoded.userId;
    next();
  });
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증하고, 없으면 그냥 통과)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 토큰이 없으면 그냥 통과
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      // 토큰이 유효하면 사용자 ID 추가
      req.userId = decoded.userId;
    }
    // 토큰이 무효하거나 없어도 계속 진행
    next();
  });
};

// 관리자 권한 확인 미들웨어
const requireAdmin = async (req, res, next) => {
  const User = require('../models/User');
  
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 환경변수로 지정된 관리자 이메일 확인
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    const isEnvAdmin = adminEmails.includes(user.email);
    
    // DB role이 admin이거나 환경변수에 지정된 관리자인 경우
    if (user.role === 'admin' || isEnvAdmin) {
      req.userRole = 'admin';
      return next();
    }
    
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  } catch (error) {
    return res.status(500).json({ message: '권한 확인 중 오류가 발생했습니다.' });
  }
};

// 인증과 관리자 권한을 동시에 확인하는 미들웨어
const authenticateAdmin = [authenticateToken, requireAdmin];

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  authenticateAdmin
}; 