const { DynamoDBClient, PutItemCommand, GetItemCommand, UpdateItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'UserLeaderBoard';
const dynamoClient = new DynamoDBClient({
    region: 'ap-northeast-2',
});
const s3Client = new S3Client({ region: 'ap-northeast-2' });
const S3_BUCKET_NAME = 'voteingweb'; 

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
const getVoteById = async (eventOrVoteId) => {
    let voteId;
    
    // event가 전달되었을 때, pathParameters에서 voteId를 추출
    if (eventOrVoteId && eventOrVoteId.pathParameters) {
        voteId = eventOrVoteId.pathParameters.voteId;
    } else {
        // 직접 voteId가 전달된 경우
        voteId = eventOrVoteId;
    }
    // voteId가 유효하지 않은 경우
    if (!voteId) {
        console.error("Vote ID is missing or invalid.");
        return { statusCode: 400, body: JSON.stringify({ error: 'Vote ID is required' }) };
    }

    try {
        console.log("Fetching results for voteId:", voteId);

        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);
        console.log("Fetched data:", JSON.stringify(data, null, 2));

        if (!data.Item) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Vote not found' }) };
        }

        const vote = {
            id: data.Item.id.S,
            title: data.Item.title.S,
            options: data.Item.options.M || {},  // Map 처리 (없을 경우 빈 객체)
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

        // getVoteById 호출 시, event 객체를 그대로 전달
        const updatedVote = await getVoteById(event);  // 여기서 event 객체를 넘겨줌
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

// 투표 결과를 DynamoDB에서 조회하는 함수
const getVoteResultsById = async (eventOrVoteId) => {
    let voteId;

    // event에서 voteId 추출
    if (eventOrVoteId && eventOrVoteId.pathParameters) {
        voteId = eventOrVoteId.pathParameters.voteId;
    } else {
        voteId = eventOrVoteId; // 직접 전달된 voteId 처리
    }

    // voteId가 유효하지 않을 경우 에러 반환
    if (!voteId) {
        console.error("Vote ID is missing or invalid.");
        return { statusCode: 400, body: JSON.stringify({ error: 'Vote ID is required' }) };
    }

    try {
        console.log("Fetching results for voteId:", voteId);

        // DynamoDB에서 투표 결과 조회
        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: { id: { S: voteId } },
        });

        const data = await dynamoClient.send(command);
        console.log("Fetched data:", JSON.stringify(data, null, 2));

        if (!data.Item) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Vote results not found' }) };
        }

        // DynamoDB에서 데이터 가공
        const options = data.Item.options.M || {}; // 투표 항목 (Map)
        const formattedOptions = Object.keys(options).reduce((acc, key) => {
            acc[key] = parseInt(options[key].N || '0', 10); // 숫자형 변환
            return acc;
        }, {});

        // 결과 형식에 맞게 반환 객체 구성
        const voteResults = {
            title: data.Item.title.S,
            options: formattedOptions, // 투표 항목 결과
        };

        return { statusCode: 200, body: JSON.stringify(voteResults) };
    } catch (error) {
        console.error('Error fetching vote results:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch vote results' }) };
    }
};



const uploadFileToS3 = async (fileName, fileContent) => {
    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileName,
            Body: fileContent,
        });

        const data = await s3Client.send(command);
        console.log('File uploaded successfully:', data);
        return { statusCode: 200, body: JSON.stringify({ message: 'File uploaded successfully' }) };
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to upload file' }) };
    }
};
const getFileFromS3 = async (fileName) => {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: fileName,
        });

        const data = await s3Client.send(command);
        console.log('File retrieved successfully:', data);
        return { statusCode: 200, body: JSON.stringify({ message: 'File retrieved successfully', data }) };
    } catch (error) {
        console.error('Error retrieving file from S3:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to retrieve file' }) };
    }
};

module.exports = {  getVoteResultsById, createVote, getVoteById, submitVote, getAllVotes, uploadFileToS3, getFileFromS3 };
