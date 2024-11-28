import AWS from 'aws-sdk';

// DynamoDB DocumentClient 초기화 (AWS SDK를 사용하여 DynamoDB와 상호작용)
const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    // Lambda 함수가 호출되었음을 로그에 기록
    console.log("Lambda function invoked");
    console.log("Received event:", JSON.stringify(event, null, 2)); // 전체 이벤트 로그 출력

    // 요청 본문(body)이 비어있는지 확인
    if (!event.body) {
        console.error("Request body is missing"); // 요청이 없는 경우 오류 로그
        return {
            statusCode: 400, // HTTP 400: Bad Request
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 정책 허용 (모든 도메인)
            },
            body: JSON.stringify({ message: "Request body is missing" }),
        };
    }

    let body;
    try {
        // 요청 본문을 JSON으로 파싱
        body = JSON.parse(event.body);
        console.log("Parsed body:", body); // 파싱된 요청 본문을 로그에 출력
    } catch (err) {
        // JSON 파싱 중 오류 발생 시 처리
        console.error("JSON parsing error:", err);
        return {
            statusCode: 400, // HTTP 400: Bad Request
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 허용
            },
            body: JSON.stringify({ message: "Invalid JSON format", error: err.message }),
        };
    }

    // 요청 본문에서 username과 password 추출
    const { username, password } = body;

    // username 또는 password가 누락되었는지 확인
    if (!username || !password) {
        console.error("Validation error: Missing username or password"); // 필수 값 누락 로그
        return {
            statusCode: 400, // HTTP 400: Bad Request
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 허용
            },
            body: JSON.stringify({ message: "Missing username or password" }),
        };
    }

    // DynamoDB에서 기존 사용자 조회를 위한 매개변수 설정
    const getParams = {
        TableName: "Users", // DynamoDB 테이블 이름
        Key: { username: username }, // username을 기본 키로 사용하여 검색
    };

    let existingUser;
    try {
        // DynamoDB에서 사용자 조회
        existingUser = await dynamo.get(getParams).promise();
        console.log("DynamoDB get response:", existingUser); // 조회 결과 로그

        if (existingUser.Item) {
            // 사용자가 이미 존재하는 경우
            console.error("User already exists:", username); // 사용자 중복 오류 로그
            return {
                statusCode: 400, // HTTP 400: Bad Request
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 허용
                },
                body: JSON.stringify({ message: "User already exists" }),
            };
        }
    } catch (err) {
        // DynamoDB 조회 중 오류 발생
        console.error("DynamoDB query error:", err);
        return {
            statusCode: 500, // HTTP 500: Internal Server Error
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 허용
            },
            body: JSON.stringify({ message: "Error querying database", error: err.message }),
        };
    }

    // 새 사용자 추가를 위한 DynamoDB 매개변수 설정
    const putParams = {
        TableName: "Users", // DynamoDB 테이블 이름
        Item: {
            username: username, // 사용자 이름
            password: password, // 평문으로 저장되는 비밀번호 (보안이 필요하다면 해싱 필요)
        },
    };

    try {
        // DynamoDB에 새 사용자 추가
        await dynamo.put(putParams).promise();
        console.log("User added successfully:", username); // 사용자 추가 성공 로그
    } catch (err) {
        // DynamoDB 삽입 중 오류 발생
        console.error("DynamoDB insert error:", err);
        return {
            statusCode: 500, // HTTP 500: Internal Server Error
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 허용
            },
            body: JSON.stringify({ message: "Error saving user to database", error: err.message }),
        };
    }

    // 사용자 생성 성공 응답 반환
    return {
        statusCode: 200, // HTTP 200: OK
        headers: {
            "Access-Control-Allow-Origin": "*", // CORS 허용
        },
        body: JSON.stringify({ message: "User created successfully" }), // 성공 메시지 반환
    };
};
