const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 파일 입출력
const path = require('path'); // 경로 문제 해결

const app = express();
const PORT = 3000;

// 미들웨어
app.use(cors());
app.use(express.json()); // JSON 파싱

// db.json 경로를 절대경로로 설정 (어디서 실행해도 문제 없음)
const dbPath = path.join(__dirname, 'db.json');

// ✅ 1. 회원가입 API
app.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '모든 정보를 입력해주세요.' });
  }

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const existingUser = db.users.find(user => user.email === email);

    if (existingUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name
    };

    db.users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    console.log('✅ 새로운 사용자 등록:', newUser);
    res.status(201).json({ message: '회원가입 성공!', user: newUser });

  } catch (err) {
    console.error('❌ 파일 읽기 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ✅ 2. 로그인 API
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const user = db.users.find(user => user.email === email && user.password === password);

    if (user) {
      console.log('✅ 로그인 성공:', user.email);
      res.status(200).json({ message: '로그인 성공!', userId: user.id });
    } else {
      res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
    }

  } catch (err) {
    console.error('❌ 파일 읽기 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 로컬 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});