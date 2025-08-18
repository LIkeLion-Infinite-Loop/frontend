const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 파일 입출력
const path = require('path'); // 경로 문제 해결

const app = express();
const PORT = 8080;

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

// ✅ 3. 아이디 찾기 API
app.post('/api/users/find-id', (req, res) => {
  // ✅ 요청 본문 확인 로그
  console.log('📩 아이디 찾기 요청:', req.body);

  const { name, email } = req.body;

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const user = db.users.find((u) => u.name === name && u.email === email);

  if (user) {
    res.status(200).json({ user_id: user.id });
  } else {
    res.status(404).json({ message: '일치하는 사용자가 없습니다.' });
  }
});

// 4. 비밀번호 재설정 API (/api/auth/reset-password)
app.post('/api/auth/reset-password', (req, res) => {
    const { name, email } = req.body;
  
    // 필수 정보 누락 시 400
    if (!name || !email) {
      return res.status(400).json({ message: '이름과 이메일을 모두 입력해주세요.' });
    }
  
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const user = db.users.find(u => u.name === name && u.email === email);
  
    if (!user) {
      return res.status(404).json({ message: '일치하는 사용자를 찾을 수 없습니다.' });
    }
  
    // 인증코드 생성 (실제로 이메일 보내는 로직은 생략)
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
  
    console.log(`📧 ${email}로 인증코드 전송됨: ${authCode}`);
  
    // 여기서는 인증코드를 반환하지만 실제 앱에서는 이메일로 보내야 함
    res.status(200).json({
      message: '비밀번호 재설정을 위한 인증코드가 이메일로 전송되었습니다.',
      authCode: authCode, // 실제 서비스에서는 이걸 응답에 넣지 않음
    });
  });

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 로컬 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

console.log('📂 사용하는 DB 경로:', dbPath);