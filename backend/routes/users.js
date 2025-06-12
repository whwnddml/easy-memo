const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// 사용자 목록 조회
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('email createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 조회 (ID 또는 이메일로)
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let user;

    // ObjectId인지 확인하여 _id로 조회하거나 email로 조회
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findById(identifier);
    } else {
      user = await User.findOne({ email: identifier });
    }

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// 사용자 생성
router.post('/', async (req, res, next) => {
  try {
    const { email } = req.body;

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

    const user = new User({
      email: email.trim()
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB 중복 키 에러
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }
    next(error);
  }
});

// 사용자 수정
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
    }

    if (!email || !email.trim()) {
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

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email: email.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json(updatedUser);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }
    next(error);
  }
});

// 사용자 삭제
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
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

module.exports = router; 