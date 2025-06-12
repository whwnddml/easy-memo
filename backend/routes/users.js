const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// JWT 시크릿 키 (실제 운영에서는 환경변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT 토큰 생성 함수
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 사용자 목록 조회 (관리자 권한 필요)
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('email socialProvider createdAt');  // 패스워드는 제외하고 반환
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 조회 (본인만 조회 가능)
router.get('/:identifier', authenticateToken, async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const requestUserId = req.userId; // JWT에서 추출한 사용자 ID
    let user;

    // ObjectId인지 확인하여 _id로 조회하거나 email로 조회
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier).select('-password');
    } else {
      user = await User.findOne({ email: identifier }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 본인의 정보만 조회 가능
    if (user._id.toString() !== requestUserId) {
      return res.status(403).json({ message: '본인의 정보만 조회할 수 있습니다.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 사용자 생성 (일반 회원가입)
router.post('/', async (req, res, next) => {
  try {
    const { email, password, socialKey, socialProvider } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: '이메일은 필수입니다.' });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
    }

    // 중복 이메일 확인
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    // 소셜 키 중복 확인 (소셜 키가 제공된 경우)
    if (socialKey) {
      const existingSocialUser = await User.findOne({ socialKey });
      if (existingSocialUser) {
        return res.status(409).json({ message: '이미 존재하는 소셜 계정입니다.' });
      }
    }

    // 첫 번째 사용자는 자동으로 관리자로 설정
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    
    const userData = {
      email: email.trim(),
      role: isFirstUser ? 'admin' : 'user'  // 첫 번째 사용자는 관리자
    };

    // 패스워드가 제공된 경우 해시화
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: '패스워드는 최소 6자 이상이어야 합니다.' });
      }
      userData.password = await bcrypt.hash(password, 10);
    }

    // 소셜 정보가 제공된 경우
    if (socialKey) {
      userData.socialKey = socialKey;
      userData.socialProvider = socialProvider;
    }

    const user = new User(userData);
    const savedUser = await user.save();
    
    // JWT 토큰 생성
    const token = generateToken(savedUser._id);
    
    // 응답에서 패스워드 제외
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: '회원가입 성공',
      token,
      userId: savedUser._id,
      user: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB 중복 키 에러
      if (error.keyPattern.email) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }
      if (error.keyPattern.socialKey) {
        return res.status(409).json({ message: '이미 존재하는 소셜 계정입니다.' });
      }
    }
    next(error);
  }
});

// 사용자 수정 (본인만 수정 가능)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, socialKey, socialProvider } = req.body;
    const requestUserId = req.userId; // JWT에서 추출한 사용자 ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
    }

    // 본인의 정보만 수정 가능
    if (id !== requestUserId) {
      return res.status(403).json({ message: '본인의 정보만 수정할 수 있습니다.' });
    }

    const updateData = {};

    // 이메일 수정
    if (email) {
      if (!email.trim()) {
        return res.status(400).json({ message: '이메일은 필수입니다.' });
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: '올바른 이메일 형식이 아닙니다.' });
      }

      // 다른 사용자가 같은 이메일을 사용하는지 확인
      const existingUser = await User.findOne({ 
        email: email.trim(), 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }

      updateData.email = email.trim();
    }

    // 패스워드 수정
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: '패스워드는 최소 6자 이상이어야 합니다.' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 소셜 정보 수정
    if (socialKey !== undefined) {
      if (socialKey) {
        // 다른 사용자가 같은 소셜 키를 사용하는지 확인
        const existingSocialUser = await User.findOne({ 
          socialKey, 
          _id: { $ne: id } 
        });
        if (existingSocialUser) {
          return res.status(409).json({ message: '이미 존재하는 소셜 계정입니다.' });
        }
      }
      updateData.socialKey = socialKey;
    }

    if (socialProvider !== undefined) {
      updateData.socialProvider = socialProvider;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }
      if (error.keyPattern.socialKey) {
        return res.status(409).json({ message: '이미 존재하는 소셜 계정입니다.' });
      }
    }
    next(error);
  }
});

// 사용자 삭제 (본인만 삭제 가능)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestUserId = req.userId; // JWT에서 추출한 사용자 ID

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
    }

    // 본인만 삭제 가능
    if (id !== requestUserId) {
      return res.status(403).json({ message: '본인의 계정만 삭제할 수 있습니다.' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 해당 사용자의 모든 메모도 삭제 (선택사항)
    const Memo = require('../models/Memo');
    await Memo.deleteMany({ userId: id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 로그인 API (이메일 + 패스워드)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 패스워드는 필수입니다.' });
    }

    // 사용자 찾기
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    // 패스워드 확인
    if (!user.password) {
      return res.status(401).json({ message: '소셜 로그인 계정입니다. 소셜 로그인을 이용해주세요.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '이메일 또는 패스워드가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = generateToken(user._id);

    // 응답에서 패스워드 제외
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: '로그인 성공',
      token,
      userId: user._id,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// 소셜 로그인 API
router.post('/social-login', async (req, res, next) => {
  try {
    const { socialKey, socialProvider, email } = req.body;

    if (!socialKey || !socialProvider) {
      return res.status(400).json({ message: '소셜 키와 제공자는 필수입니다.' });
    }

    // 소셜 키로 사용자 찾기
    let user = await User.findOne({ socialKey });

    if (!user && email) {
      // 소셜 키로 찾지 못했지만 이메일이 있는 경우, 기존 계정에 소셜 정보 연결
      user = await User.findOne({ email: email.trim() });
      if (user) {
        // 기존 계정에 소셜 정보 추가
        user.socialKey = socialKey;
        user.socialProvider = socialProvider;
        await user.save();
      }
    }

    if (!user) {
      // 새 소셜 사용자 생성
      if (!email) {
        return res.status(400).json({ message: '신규 소셜 사용자는 이메일이 필요합니다.' });
      }

      user = new User({
        email: email.trim(),
        socialKey,
        socialProvider
      });
      await user.save();
    }

    // JWT 토큰 생성
    const token = generateToken(user._id);

    // 응답에서 패스워드 제외
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: '소셜 로그인 성공',
      token,
      userId: user._id,
      user: userResponse
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
      }
      if (error.keyPattern.socialKey) {
        return res.status(409).json({ message: '이미 존재하는 소셜 계정입니다.' });
      }
    }
    next(error);
  }
});

// 사용자 역할 변경 API (관리자만 가능)
router.patch('/:id/role', authenticateAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
    }

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: '올바른 역할(user 또는 admin)을 지정해주세요.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 자기 자신의 관리자 권한은 제거할 수 없음 (최후의 관리자 보호)
    if (id === req.userId && role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: '최후의 관리자는 권한을 제거할 수 없습니다.' });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      message: `사용자 역할이 ${role}로 변경되었습니다.`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// 토큰 검증 API
router.post('/verify-token', authenticateToken, async (req, res, next) => {
  try {
    // JWT 미들웨어에서 이미 토큰을 검증했으므로 사용자 정보만 반환
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      message: '토큰 검증 성공',
      userId: user._id,
      user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 