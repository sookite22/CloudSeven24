const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5500;

app.use(express.json());
app.use(cors());

const resultsFile = 'results.json';

// 투표 데이터 로드 함수
function loadResults() {
    if (fs.existsSync(resultsFile)) {
        const data = fs.readFileSync(resultsFile, 'utf8');
        return JSON.parse(data);
    }
    return {};
}

// 투표 데이터 저장 함수
function saveResults(results) {
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2), 'utf8');
}

// 투표하기
app.post('/vote', (req, res) => {
    const { option } = req.body;
    const results = loadResults();

    if (results[option]) {
        results[option]++;
    } else {
        results[option] = 1;
    }
    saveResults(results);
    res.json({ result: 'success' });
});

// 투표 결과 조회
app.get('/results', (req, res) => {
    const results = loadResults();
    res.json(results);
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
