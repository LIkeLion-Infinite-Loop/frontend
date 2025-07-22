const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 파일을 읽고 쓰기 위한 모듈
const app = express();
const PORT = 3000; // 서버가 사용할 포트 번호

app.use(cors());
app.use(express.json()); // 클라이언트가 보낸 JSON 데이터를 파싱하기 위함

const dbPath = './db.json';

// 1. 회원가입 API (/register)
app.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '모든 정보를 입력해주세요.' });
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const existingUser = db.users.find(user => user.email === email);

  if (existingUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  const newUser = { id: Date.now().toString(), email, password, name };
  db.users.push(newUser);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

  console.log('새로운 사용자 등록:', newUser);
  res.status(201).json({ message: '회원가입 성공!', user: newUser });
});

// 2. 로그인 API (/login)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const user = db.users.find(user => user.email === email && user.password === password);

  if (user) {
    console.log('로그인 성공:', user.email);
    // 실제 앱에서는 여기에 토큰(token)을 발급해줍니다.
    res.status(200).json({ message: '로그인 성공!', userId: user.id });
  } else {
    res.status(401).json({ message: '이메일 또는 비밀번호가 일치하지 않습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`로컬 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});