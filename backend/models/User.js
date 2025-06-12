const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: {
    type: String,
    required: false  // 소셜 로그인 사용자는 패스워드가 없을 수 있음
  },
  socialKey: {
    type: String,
    required: false,
    unique: true,
    sparse: true  // null 값도 허용하면서 unique 제약조건 적용
  },
  socialProvider: {
    type: String,
    required: false,
    enum: ['google', 'facebook', 'kakao', 'naver', null]  // 소셜 로그인 제공자
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  }
});

module.exports = mongoose.model('User', userSchema); 