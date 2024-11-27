import AWS from 'aws-sdk';
const dynamo = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    console.log("Lambda function invoked");
    console.log("Received event:", JSON.stringify(event, null, 2)); // 요청 전체 출력 (JSON 포맷)

    try {
        // 요청 본문 확인
        if (!event.body) {
            console.error("Request body is missing");
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "Request body is missing" }),
            };
        }

        // JSON 파싱
        let body;
        try {
            body = JSON.parse(event.body);
            console.log("Parsed body:", body);
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "Invalid JSON format" }),
            };
        }

        const { username, password } = body;

        // 유효성 검사
        if (!username || !password) {
            console.error("Validation failed: Missing username or password");
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "Missing username or password" }),
            };
        }

        // DynamoDB에서 사용자 확인
        const getParams = {
            TableName: "Users",
            Key: { username: username },
        };

        let existingUser;
        try {
            existingUser = await dynamo.get(getParams).promise();
            console.log("DynamoDB get response:", existingUser);
        } catch (error) {
            console.error("Failed to query DynamoDB:", error);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "Error querying database", error: error.message }),
            };
        }

        // 이미 존재하는 사용자 처리
        if (existingUser.Item) {
            console.error("User already exists:", username);
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "User already exists" }),
            };
        }

        // DynamoDB에 사용자 추가
        const params = {
            TableName: "Users",
            Item: {
                username: username,
                password: password, // 실제 서비스에서는 비밀번호 암호화 필요
            },
        };

        try {
            await dynamo.put(params).promise();
            console.log("User added successfully:", username);
        } catch (error) {
            console.error("Failed to insert into DynamoDB:", error);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*", // CORS 설정
                },
                body: JSON.stringify({ message: "Error saving user to database", error: error.message }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 설정
            },
            body: JSON.stringify({ message: "User created successfully" }),
        };
    } catch (error) {
        // Lambda 함수 전체 에러 처리
        console.error("Unhandled error occurred:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*", // CORS 설정
            },
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};
