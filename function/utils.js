const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.AKIATQPD7DI7P76WWXLP,
        secretAccessKey: process.env.jk74u56J4qosmu7cb36Jzx93RvUzJUAONyH3m9QJ,
    },
});

module.exports = { dynamoClient };
