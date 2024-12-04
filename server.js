const express = require('express');
const cors = require('cors');
const app = express();
const port = 5500;
require('dotenv').config(); // .env 파일의 환경 변수를 로드
const bodyParser = require('body-parser'); // 요청 본문 파싱
const { v4: uuidv4 } = require('uuid'); // 고유 ID 생성

// AWS SDK 모듈 로드 및 DynamoDB 클라이언트 초기화
const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');

// AWS DynamoDB 클라이언트 구성
const dynamoClient = new DynamoDBClient({
    region: "ap-northeast-2", // 기본값으로 사용
    credentials: {
        accessKeyId: "AKIATQPD7DI7P76WWXLP",
        secretAccessKey: "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"
    }
});

// 미들웨어 설정
app.use(bodyParser.json()); // JSON 요청 본문 파싱
app.use(express.json()); // Express의 JSON 파서 활성화
app.use(cors()); // Cross-Origin Resource Sharing 활성화
app.use(express.static('public')); // 정적 파일 제공

// DynamoDB에서 사용할 테이블 이름
const TABLE_NAME = 'UserLeaderBoard';

/**
 * 특정 투표 항목의 선택지 카운트를 증가시키는 함수
 * @param {string} voteId - 투표 ID
 * @param {string} option - 증가시킬 선택지
 */
const updateVoteOption = async (voteId, option) => {
    try {
        const updateCommand = new UpdateItemCommand({
            TableName: TABLE_NAME,  // 테이블 이름
            Key: { id: { S: voteId } },  // 투표 ID를 기준으로 항목 업데이트
            UpdateExpression: 'ADD options.#opt :inc', // 선택지 카운트 증가
            ExpressionAttributeNames: {
                '#opt': option, // 선택지 이름
            },
            ExpressionAttributeValues: {
                ':inc': { N: '1' }, // 증가값 (1)
            },
        });

        console.log('Executing UpdateItemCommand:', updateCommand);
        const result = await dynamoClient.send(updateCommand); // DynamoDB 업데이트 실행
        console.log('DynamoDB Update Result:', result);
    } catch (error) {
        console.error('DynamoDB Update Error:', error);
        throw error;
    }
};

/**
 * 특정 투표 ID로 투표 데이터를 가져오는 함수
 * @param {string} voteId - 투표 ID
 * @returns {Object} 투표 데이터
 */
const getVoteById = async (voteId) => {
    try {
        const command = new GetItemCommand({
            TableName: TABLE_NAME,  
            Key: { id: { S: voteId } }, // ID를 기준으로 항목 조회
        });

        const data = await dynamoClient.send(command);
        
        if (!data.Item) {
            throw new Error('Vote not found'); // 투표 데이터가 없으면 예외 발생
        }

        const vote = {
            id: data.Item.id.S, // 투표 ID
            title: data.Item.title.S, // 투표 제목
            options: data.Item.options ? data.Item.options.M : {}, // 선택지
            selectionType: data.Item.selectionType.S, // 선택 유형
            deadline: data.Item.deadline.S, // 마감 시간
        };

        return vote; // 클라이언트가 사용할 수 있는 형식으로 반환
    } catch (error) {
        console.error('Error fetching vote details:', error);
        throw new Error('Failed to fetch vote details');
    }
};

// 사용자 회원가입 처리
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const params = {
        TableName: TABLE_NAME, // DynamoDB 테이블 이름
        Item: {
            id: { S: username }, // 사용자 ID
            password: { S: password }, // 사용자 비밀번호
            createdAt: { S: new Date().toISOString() }, // 가입 날짜
        },
        Key: { id: { S: username } }, // 사용자 조회를 위한 Key
    };

    try {
        // 사용자 존재 여부 확인
        const command2 = new GetItemCommand(params);
        const result = await dynamoClient.send(command2);

        if (result.Item) {
            return res.status(409).json({ result: 'fail', message: '이미 존재하는 사용자입니다.' });
        }
        
        // 사용자 등록
        const command = new PutItemCommand(params);
        await dynamoClient.send(command);
        res.status(201).json({ message: 'User added successfully.' });
    } catch (err) {
        console.error('Error adding user to DynamoDB:', err);
        res.status(500).json({ message: 'Failed to add user to DynamoDB.' });
    }
});

// 사용자 로그인 처리
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ result: 'fail', message: '아이디와 비밀번호를 입력해주세요.' });
    }

    const params = {
        TableName: TABLE_NAME,
        Key: { id: { S: username } }, // 사용자 ID로 조회
    };

    try {
        const command = new GetItemCommand(params);
        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        const storedPassword = result.Item.password.S;

        if (storedPassword === password) {
            return res.json({ result: 'success' });
        } else {
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }
    } catch (err) {
        console.error('Error querying DynamoDB:', err);
        return res.status(500).json({ result: 'fail', message: '서버 오류가 발생했습니다.' });
    }

});

    
// 사용자 비밀번호 업데이트
app.post('/update-user', async (req, res) => {
    const { username, newPassword } = req.body;

    // 필수 값 확인
    if (!username || !newPassword) {
        return res.status(400).json({ result: 'fail', message: 'Username and newPassword are required.' });
    }

    const params = {
        TableName: TABLE_NAME, // DynamoDB 테이블 이름
        Key: { id: { S: username } }, // 사용자 ID로 조회
    };

    try {
        // 사용자 정보 가져오기
        const getItemCommand = new GetItemCommand(params);
        const result = await dynamoClient.send(getItemCommand);

        if (!result.Item) {
            return res.status(404).json({ result: 'fail', message: '사용자가 존재하지 않습니다.' });
        }

        // 비밀번호 업데이트를 위한 파라미터 설정
        const updateParams = {
            TableName: TABLE_NAME,
            Key: { id: { S: username } },
            UpdateExpression: 'SET password = :newPassword', // 비밀번호 업데이트
            ExpressionAttributeValues: {
                ':newPassword': { S: newPassword }, // 새로운 비밀번호
            },
            ReturnValues: 'ALL_NEW', // 업데이트된 항목 반환
        };

        const updateCommand = new UpdateItemCommand(updateParams);
        const updateResult = await dynamoClient.send(updateCommand);

        // 성공적으로 업데이트된 데이터 반환
        return res.json({
            result: 'success',
            message: '비밀번호가 성공적으로 업데이트되었습니다.',
            updatedItem: updateResult.Attributes,
        });
    } catch (err) {
        console.error('Error updating item in DynamoDB:', err);
        return res.status(500).json({ result: 'fail', message: '서버 오류가 발생했습니다.' });
    }
});

// 새 투표 생성
app.post('/api/votes', async (req, res) => {
    const { title, options, deadline, selectionType } = req.body;

    // 필드 검증
    if (!title || !options || !deadline || !selectionType) {
        return res.status(400).json({ error: '모든 필드를 입력하세요.' });
    }

    const voteId = uuidv4(); // 고유한 투표 ID 생성

    // 선택지 초기 카운트를 0으로 설정
    const optionsMap = {};
    options.forEach(option => {
        optionsMap[option] = { N: "0" }; // DynamoDB에서 Map 형태로 저장
    });

    const voteData = {
        id: { S: voteId },
        title: { S: title },
        options: { M: optionsMap },
        deadline: { S: deadline },
        selectionType: { S: selectionType },
    };

    try {
        const command = new PutItemCommand({
            TableName: TABLE_NAME,
            Item: voteData,
        });

        await dynamoClient.send(command);

        // 클라이언트로 반환할 투표 데이터 생성
        const responseData = {
            id: voteId,
            title,
            options: Object.keys(optionsMap).reduce((acc, key) => {
                acc[key] = 0; // 각 옵션의 초기값은 0
                return acc;
            }, {}),
            selectionType,
            deadline,
        };

        res.status(201).json(responseData);
    } catch (error) {
        console.error('DynamoDB 저장 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 투표를 저장하지 못했습니다.' });
    }
});

// 모든 투표 조회
app.get('/api/votes', async (req, res) => {
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME }); // 테이블 내 모든 항목 스캔
        const data = await dynamoClient.send(command);

        // 결과에서 필요한 데이터만 변환
        const votes = data.Items
            .filter(item => item.title && item.title.S) // title이 있는 항목만 필터링
            .map(item => ({
                id: item.id ? item.id.S : 'No ID', // ID가 없는 경우 기본값 설정
                title: item.title ? item.title.S : 'No Title',
                deadline: item.deadline ? item.deadline.S : 'No Deadline',
            }));

        res.json(votes);
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});


// 투표 제출 처리
app.post('/api/vote', async (req, res) => {
    const { voteId, options, selectionType } = req.body;

    if (!voteId || !Array.isArray(options) || options.length === 0 || !selectionType) {
        return res.status(400).json({ error: 'Invalid vote submission. Please check the request body.' });
    }

    try {
        // 다중 선택 처리
        if (selectionType === 'multiple') {
            for (const option of options) {
                await updateVoteOption(voteId, option); // 각 선택지 카운트 증가
            }
        } else if (selectionType === 'single') {
            const option = options[0]; // 단일 선택은 첫 번째 값만 사용
            await updateVoteOption(voteId, option);
        } else {
            return res.status(400).json({ error: 'Invalid selection type' });
        }

        // 업데이트된 투표 결과 반환
        const updatedVote = await getVoteById(voteId);
        res.json(updatedVote);
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});
// 특정 투표 ID로 투표 세부 정보 조회
app.get('/api/vote/:voteId', async (req, res) => {
    const { voteId } = req.params;

    try {
        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);

        if (!data.Item) {
            return res.status(404).json({ error: 'Vote not found' });
        }

        // 필요한 데이터 변환
        const vote = {
            id: data.Item.id.S,
            title: data.Item.title.S,
            options: data.Item.options ? data.Item.options.M : {},
            selectionType: data.Item.selectionType.S,
            deadline: data.Item.deadline.S,
        };

        res.json(vote);
    } catch (error) {
        console.error('Error fetching vote details:', error);
        res.status(500).json({ error: 'Failed to fetch vote details' });
    }
});

// 특정 투표 결과 조회
app.get('/api/results/:voteId', async (req, res) => {
    const { voteId } = req.params;

    try {
        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
        });

        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return res.status(404).json({ error: 'Vote not found' });
        }

        // 선택지와 각 선택지별 카운트 변환
        const options = result.Item.options.M;
        const parsedOptions = Object.entries(options).reduce((acc, [key, value]) => {
            acc[key] = parseInt(value.N, 10); // 문자열을 숫자로 변환
            return acc;
        }, {});

        res.json({
            title: result.Item.title.S, // 투표 제목
            options: parsedOptions, // 선택지와 카운트
        });
    } catch (error) {
        console.error('Error fetching vote results:', error);
        res.status(500).json({ error: 'Failed to fetch vote results' });
    }
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

