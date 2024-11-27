import AWS from 'aws-sdk'; // AWS SDK를 import
const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    console.log("Lambda function invoked");
    console.log("Received event:", JSON.stringify(event, null, 2));

    // OPTIONS 요청 처리 (Preflight 요청)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Preflight response" }),
        };
    }

    try {
        // 요청의 body에서 username과 password를 추출
        const body = JSON.parse(event.body);
        const { username, password } = body;

        // 유효성 검사
        if (!username || !password) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Missing username or password" }),
            };
        }

        // DynamoDB에서 username으로 데이터 조회
        const getParams = {
            TableName: "Users",
            Key: { username: username },
        };

        console.log("DynamoDB getParams:", JSON.stringify(getParams));
        const user = await dynamo.get(getParams).promise();

        if (!user.Item) {
            // 유저가 없으면 404 응답
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "User not found" }),
            };
        }

        console.log("User found:", user.Item);

        // 비밀번호 일치 여부 확인
        if (user.Item.password !== password) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ message: "Incorrect password" }),
            };
        }

        // 로그인 성공
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Login successful", user: user.Item }),
        };
    } catch (error) {
        // 오류 처리
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ message: "Error logging in", error: error.message }),
        };
    }
};
