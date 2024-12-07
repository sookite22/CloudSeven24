const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'UserLeaderBoard';
const dynamoClient = new DynamoDBClient({
    region: 'ap-northeast-2',
});

// 새 투표 생성
const createVote = async (event) => {
    let parsedBody;

    // 요청 본문 확인 및 파싱
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Request body is empty' }),
            };
        }
        parsedBody = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' }),
        };
    }

    const { title, options, deadline, selectionType } = parsedBody;

    // 필수 필드 확인
    if (!title || !options || !deadline || !selectionType) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '모든 필드를 입력하세요.' }),
        };
    }

    // 투표 데이터 생성
    const voteId = uuidv4();
    const optionsMap = options.reduce((acc, option) => {
        acc[option] = { N: '0' };
        return acc;
    }, {});

    const voteData = {
        id: { S: voteId },
        title: { S: title },
        options: { M: optionsMap },
        deadline: { S: deadline },
        selectionType: { S: selectionType },
    };

    try {
        // DynamoDB에 투표 데이터 삽입
        const command = new PutItemCommand({ TableName: TABLE_NAME, Item: voteData });
        await dynamoClient.send(command);

        // 성공 응답
        return {
            statusCode: 201,
            body: JSON.stringify({
                id: voteId,
                title,
                options: Object.keys(optionsMap).reduce((acc, key) => {
                    acc[key] = 0;
                    return acc;
                }, {}),
                selectionType,
                deadline,
            }),
        };
    } catch (error) {
        console.error('Error creating vote:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create vote' }),
        };
    }
};

// 특정 투표 조회
const getVoteById = async (event) => {
    const voteId = event.pathParameters.voteId;

    try {
        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);

        if (!data.Item) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Vote not found' }) };
        }

        const vote = {
            id: data.Item.id.S,
            title: data.Item.title.S,
            options: data.Item.options.M,
            selectionType: data.Item.selectionType.S,
            deadline: data.Item.deadline.S,
        };

        return { statusCode: 200, body: JSON.stringify(vote) };
    } catch (error) {
        console.error('Error fetching vote:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch vote' }) };
    }
};

// 모든 투표 조회
const getAllVotes = async () => {
    try {
        const command = new ScanCommand({ TableName: TABLE_NAME });
        const data = await dynamoClient.send(command);

        const votes = data.Items.map((item) => ({
            id: item.id.S,
            title: item.title.S,
            deadline: item.deadline ? item.deadline.S : 'No Deadline',
        }));

        return { statusCode: 200, body: JSON.stringify(votes) };
    } catch (error) {
        console.error('Error fetching all votes:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch votes' }) };
    }
};

// 투표 제출 처리
const submitVote = async (event) => {
    const { voteId, options, selectionType } = JSON.parse(event.body);

    if (!voteId || !Array.isArray(options) || options.length === 0 || !selectionType) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid vote submission.' }) };
    }

    try {
        if (selectionType === 'multiple') {
            for (const option of options) {
                await updateVoteOption(voteId, option);
            }
        } else if (selectionType === 'single') {
            await updateVoteOption(voteId, options[0]);
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid selection type' }) };
        }

        const updatedVote = await getVoteById({ pathParameters: { voteId } });
        return updatedVote;
    } catch (error) {
        console.error('Error submitting vote:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit vote' }) };
    }
};

// 선택지 카운트 업데이트
const updateVoteOption = async (voteId, option) => {
    try {
        const command = new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
            UpdateExpression: 'ADD options.#opt :inc',
            ExpressionAttributeNames: { '#opt': option },
            ExpressionAttributeValues: { ':inc': { N: '1' } },
        });

        await dynamoClient.send(command);
    } catch (error) {
        console.error('Error updating vote option:', error);
        throw error;
    }
};
const getResults = async (voteId) => {
    try {
        const command = new GetItemCommand({
            TableName: 'UserLeaderBoard',
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);

        if (!data.Item) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Vote not found' }) };
        }

        const results = {
            id: data.Item.id.S,
            title: data.Item.title.S,
            options: data.Item.options.M,
            selectionType: data.Item.selectionType.S,
            deadline: data.Item.deadline.S,
        };

        return { statusCode: 200, body: JSON.stringify(results) };
    } catch (error) {
        console.error('Error fetching vote results:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch vote results' }) };
    }
};

module.exports = {  createVote, getVoteById, getResults, submitVote, getAllVotes  };
