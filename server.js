const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5500;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const usersFile = 'users.json';

// 사용자 데이터 로드 함수
function loadUsers() {
    if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile);
        return JSON.parse(data);
    }
    return [];
}

// 사용자 데이터 저장 함수
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        return res.json({ result: 'success' });
    } else {
        return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 잘못되었습니다.' });
    }
});


// 회원가입 라우트
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        return res.status(409).json({ result: 'fail', message: '이미 존재하는 사용자입니다.' });
    }
    
    users.push({ username, password });
    saveUsers(users);
    res.json({ result: 'success' });
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
