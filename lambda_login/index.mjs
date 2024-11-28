import AWS from 'aws-sdk';

// DynamoDB DocumentClient 초기화 (AWS SDK를 사용하여 DynamoDB와 상호작용)
const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    console.log("Lambda function invoked");
    console.log("Received event:", JSON.stringify(event, null, 2)); // 요청 전체 출력

    // OPTIONS 요청 처리 (CORS Preflight 요청 대응)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200, // HTTP 200: OK
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 도메인 허용 (CORS 정책)
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS", // 허용된 메서드
                "Access-Control-Allow-Headers": "Content-Type", // 허용된 헤더
            },
            body: JSON.stringify({ message: "Preflight response" }), // CORS 요청 응답 메시지
        };
    }

    let body;
    try {
        // 요청 본문(JSON)을 파싱
        body = JSON.parse(event.body);
    } catch (err) {
        console.error("JSON parsing error:", err); // JSON 파싱 오류 로그 출력
        return {
            statusCode: 400, // HTTP 400: Bad Request
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Invalid JSON format" }), // JSON 형식 오류 메시지
        };
    }

    // 요청에서 사용자 이름(username)과 비밀번호(password) 추출
    const { username, password } = body;

    // 필수 필드 검증 (username 또는 password 누락 여부 확인)
    if (!username || !password) {
        return {
            statusCode: 400, // HTTP 400: Bad Request
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Missing username or password" }), // 누락된 필드에 대한 오류 메시지
        };
    }

    // DynamoDB에서 사용자 조회를 위한 매개변수 설정
    const getParams = {
        TableName: "Users", // DynamoDB 테이블 이름
        Key: { username: username }, // username을 기본 키로 검색
    };

    try {
        // DynamoDB에서 사용자 조회
        const user = await dynamo.get(getParams).promise();

        if (!user.Item) {
            // 사용자가 존재하지 않을 경우
            return {
                statusCode: 404, // HTTP 404: Not Found
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "User not found" }), // 사용자 없음 메시지
            };
        }

        // 비밀번호 검증 (해시화된 비밀번호 없이 평문 비교)
        if (user.Item.password !== password) {
            return {
                statusCode: 401, // HTTP 401: Unauthorized
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Incorrect password" }), // 비밀번호 불일치 메시지
            };
        }

        // 로그인 성공 응답
        return {
            statusCode: 200, // HTTP 200: OK
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Login successful", // 성공 메시지
                user: { username: user.Item.username }, // 사용자 정보 반환 (비밀번호 제외)
            }),
        };
    } catch (error) {
        // DynamoDB 요청 또는 기타 처리 중 오류 발생
        console.error("Error:", error); // 오류 로그 출력
        return {
            statusCode: 500, // HTTP 500: Internal Server Error
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Internal server error" }), // 서버 오류 메시지
        };
    }
};
