const express = require('express');
const cors = require('cors');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const config = require('./config.json');

const app = express();
const port = 5500;

app.use(express.json());
app.use(cors());

AWS.config.update({ region: config.Region });

const poolData = {
    UserPoolId: config.UserPoolId,
    ClientId: config.ClientId
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// 회원가입 라우트
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: username })
    ];

    userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
            return res.status(400).json({ result: 'fail', message: err.message });
        }
        res.json({ result: 'success', user: result.user.getUsername() });
    });
});

// 로그인 라우트
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password
    });

    const userData = {
        Username: username,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            const accessToken = result.getAccessToken().getJwtToken();
            res.json({ result: 'success', token: accessToken });
        },
        onFailure: (err) => {
            res.status(401).json({ result: 'fail', message: err.message });
        }
    });
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
