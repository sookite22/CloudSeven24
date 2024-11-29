const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 5500;
require('dotenv').config();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand ,ScanCommand} = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
    region: "ap-northeast-2", // 기본값으로 사용
    credentials: {
        accessKeyId: "AKIATQPD7DI7P76WWXLP",
        secretAccessKey: "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"
    }
});

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const TABLE_NAME = 'UserLeaderBoard';

// 사용자 데이터 로드 함수
function loadUsers() {
    if (fs.existsSync(usersFile)) {
        const data = fs.readFileSync(usersFile);
        return JSON.parse(data);
    }
    return [];
}
const updateVoteOption = async (voteId, option) => {
    try {
        const updateCommand = new UpdateItemCommand({
            TableName: TABLE_NAME,  // 실제 DynamoDB 테이블 이름으로 수정
            Key: { id: { S: voteId } },  // voteId를 기준으로 업데이트할 항목 선택
            UpdateExpression: 'ADD options.#opt :inc', // 옵션별 투표 수 증가
            ExpressionAttributeNames: {
                '#opt': option,  // 선택된 옵션
            },
            ExpressionAttributeValues: {
                ':inc': { N: '1' },  // 투표 수 1 증가
            },
        });

        console.log('Executing UpdateItemCommand:', updateCommand);
        const result = await dynamoClient.send(updateCommand);
        console.log('DynamoDB Update Result:', result);

    } catch (error) {
        console.error('DynamoDB Update Error:', error);
        throw error;
    }
};

// DynamoDB에서 투표 데이터를 가져오는 함수
const getVoteById= async (voteId) => {
    try {
        const command = new GetItemCommand({
            TableName: TABLE_NAME,  // 실제 테이블 이름
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);
        
        if (!data.Item) {
            throw new Error('Vote not found');
        }

        const vote = {
            id: data.Item.id.S,
            title: data.Item.title.S,
            options: data.Item.options ? data.Item.options.M : {},
            selectionType: data.Item.selectionType.S,
            deadline: data.Item.deadline.S,
        };

        return vote;
    } catch (error) {
        console.error('Error fetching vote details:', error);
        throw new Error('Failed to fetch vote details');
    }
};
// 사용자 데이터 저장 함수
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }


    // DynamoDB 파라미터 설정
    const params = {
        TableName: 'UserLeaderBoard',
        Item: {
            id: { S: username},
            password: { S: password },
            createdAt: { S: new Date().toISOString() },
        },
        Key: {
            id: { S: username },  // Partition Key로 사용자 조회
        },
    };

    try {
        const command2 = new GetItemCommand(params);
        const result = await dynamoClient.send(command2);

        // 사용자가 이미 존재하는 경우
        if (result.Item) {
            return res.status(409).json({ result: 'fail', message: '이미 존재하는 사용자입니다.' });
        }
        
        const command = new PutItemCommand(params);
        await dynamoClient.send(command);
        res.status(201).json({ message: 'User added successfully.' });
    } catch (err) {
        console.error('Error adding user to DynamoDB:', err);
        res.status(500).json({ message: 'Failed to add user to DynamoDB.' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ result: 'fail', message: '아이디와 비밀번호를 입력해주세요.' });
    }

    // DynamoDB에서 사용자 조회
    const params = {
        TableName: 'UserLeaderBoard',
        Key: {
            id: { S: username }, // Partition Key로 사용자 조회
        },
    };

    try {
        const command = new GetItemCommand(params);
        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return res.status(401).json({ result: 'fail', message: '아이디 또는 비밀번호가 잘못되었습니다.' });
        }

        // DynamoDB에서 가져온 데이터
        const storedPassword = result.Item.password.S;

        // 비밀번호 검증
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

app.post('/update-user', async (req, res) => {
    const { username, newPassword } = req.body;

    // 필수 값 확인
    if (!username || !newPassword) {
        return res.status(400).json({ result: 'fail', message: 'Username and newPassword are required.' });
    }

    // DynamoDB에서 사용자 정보 조회
    const params = {
        TableName: 'UserLeaderBoard',
        Key: {
            id: { S: username },
        },
    };

    try {
        const getItemCommand = new GetItemCommand(params);
        const result = await dynamoClient.send(getItemCommand);

        // 사용자가 존재하지 않으면
        if (!result.Item) {
            return res.status(404).json({ result: 'fail', message: '사용자가 존재하지 않습니다.' });
        }

        // 비밀번호 업데이트
        const updateParams = {
            TableName: 'UserLeaderBoard',
            Key: {
                id: { S: username },
            },
            UpdateExpression: 'SET password = :newPassword',
            ExpressionAttributeValues: {
                ':newPassword': { S: newPassword },  // 새로운 비밀번호로 업데이트
            },
            ReturnValues: 'ALL_NEW'  // 업데이트된 값을 반환
        };

        const updateCommand = new UpdateItemCommand(updateParams);
        const updateResult = await dynamoClient.send(updateCommand);

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


app.post('/api/votes', async (req, res) => {
    const { title, options, deadline, selectionType } = req.body;

    // 필드 검증
    if (!title || !options || !deadline || !selectionType) {
        return res.status(400).json({ error: '모든 필드를 입력하세요.' });
    }

    const voteId = uuidv4(); // 고유한 ID 생성

    // `options`를 초기 카운트(0)와 함께 Map으로 변환
    const optionsMap = {};
    options.forEach(option => {
        optionsMap[option] = { N: "0" }; // 각 옵션 초기값을 0으로 설정
    });

    // DynamoDB에 저장할 데이터
    const voteData = {
        id: { S: voteId },
        title: { S: title },
        options: { M: optionsMap }, // Map 형태로 저장
        deadline: { S: deadline },
        selectionType: { S: selectionType },
    };

    try {
        // DynamoDB에 데이터 저장
        const command = new PutItemCommand({
            TableName: TABLE_NAME,
            Item: voteData,
        });
        await dynamoClient.send(command);

        // 클라이언트로 반환할 데이터
        const responseData = {
            id: voteId,
            title,
            options: Object.keys(optionsMap).reduce((acc, key) => {
                acc[key] = 0; // 초기값 0으로 설정
                return acc;
            }, {}),
            selectionType,
            deadline,
        };

        res.status(201).json(responseData); // 클라이언트에 JSON 데이터 반환
    } catch (error) {
        console.error('DynamoDB 저장 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 투표를 저장하지 못했습니다.' });
    }
});

app.get('/api/votes', async (req, res) => {
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const data = await dynamoClient.send(command);

        console.log(data.Items); // 이 라인을 통해 데이터 형식을 확인할 수 있습니다.

        // DynamoDB에서 가져온 데이터를 클라이언트가 사용할 수 있는 형식으로 변환
         const votes = data.Items
            .filter(item => item.title && item.title.S) // title이 존재하는 항목만 필터링
            .map(item => ({
                id: item.id ? item.id.S : 'No ID', // id가 없는 경우 기본값을 처리
                title: item.title ? item.title.S : 'No Title', // title이 없는 경우 기본값을 처리
                deadline: item.deadline ? item.deadline.S : 'No Deadline' // deadline이 없는 경우 기본값을 처리
            }));

        res.json(votes); // JSON 형식으로 클라이언트에 응답
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

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

app.post('/api/vote', async (req, res) => {
    console.log('Request Body:', req.body); // 요청 본문 확인
    const { voteId, options, selectionType } = req.body;

    // 요청 값 확인
    if (!voteId || !Array.isArray(options) || options.length === 0 || !selectionType) {
        return res.status(400).json({ error: 'Invalid vote submission. Please check the request body.' });
    }

    console.log(`Vote ID: ${voteId}, Options: ${options}, Selection Type: ${selectionType}`);

    try {
        // 복수 선택일 경우
        if (selectionType === 'multiple') {
            for (const option of options) {
                await updateVoteOption(voteId, option); // 각 옵션별로 투표 수 증가
            }
        } 
        // 단일 선택일 경우
        else if (selectionType === 'single') {
            const option = options[0]; // 단일 선택은 첫 번째 값만 사용
            await updateVoteOption(voteId, option);
        } else {
            return res.status(400).json({ error: 'Invalid selection type' });
        }

        // 업데이트된 투표 결과 반환
        const updatedVote = await getVoteById(voteId);  // 업데이트된 투표 데이터를 가져오는 함수
        res.json(updatedVote);
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({ error: 'Failed to submit vote' });
    }
});

app.get('/api/vote/results/:voteId', async (req, res) => {
    const { voteId } = req.params;

    try {
        console.log(`Fetching results for voteId: ${voteId}`);

        const command = new GetItemCommand({
            TableName: TABLE_NAME, // 실제 테이블 이름
            Key: { id: { S: voteId } },
        });

        const result = await dynamoClient.send(command);

        if (!result.Item) {
            return res.status(404).json({ error: 'Vote not found' });
        }

        const options = result.Item.options.M;
        const parsedOptions = Object.entries(options).reduce((acc, [key, value]) => {
            acc[key] = parseInt(value.N, 10); // 숫자로 변환
            return acc;
        }, {});

        res.json({
            title: result.Item.title.S,
            options: parsedOptions,
        });
    } catch (error) {
        console.error('Error fetching vote results:', error);
        res.status(500).json({ error: 'Failed to fetch vote results' });
    }
});


app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
