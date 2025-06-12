const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
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

module.exports = mongoose.model('Memo', memoSchema); 