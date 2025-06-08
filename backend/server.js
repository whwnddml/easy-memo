const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/easymemo')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 메모 스키마 정의
const memoSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Memo = mongoose.model('Memo', memoSchema);

// API 엔드포인트
// 메모 목록 조회
app.get('/api/memos', async (req, res) => {
  try {
    const memos = await Memo.find().sort({ createdAt: -1 });
    res.json(memos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 메모 생성
app.post('/api/memos', async (req, res) => {
  try {
    const memo = new Memo({
      content: req.body.content
    });
    const savedMemo = await memo.save();
    res.status(201).json(savedMemo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 메모 삭제
app.delete('/api/memos/:id', async (req, res) => {
  try {
    await Memo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 서버 시작
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다`);
}); 