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

module.exports = {
  authenticateToken,
  optionalAuth
}; 