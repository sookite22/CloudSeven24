const { createVote, getVoteById, submitVote, getAllVotes, getResults } = require('./function/votes');

// Lambda 핸들러
exports.handler = async (event) => {
    const { path, httpMethod, body } = event;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // 모든 도메인 허용
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        if (httpMethod === 'GET' && path === '/votes') {
            const response = await getAllVotes();
            return {
                ...response,
                headers: { ...corsHeaders, ...(response.headers || {}) },
            };
        }
        if (httpMethod === 'POST' && path === '/votes') {
            const response = await createVote(event);
            return {
                ...response,
                headers: { ...corsHeaders, ...(response.headers || {}) },
            };
        }
        if (httpMethod === 'GET' && path.startsWith('/vote/')) {
            const voteId = path.split('/')[2];
            event.pathParameters = { voteId };
            const response = await getVoteById(event);
            return {
                ...response,
                headers: { ...corsHeaders, ...(response.headers || {}) },
            };
        }
        if (httpMethod === 'POST' && path.startsWith('/vote/')) {
            const voteId = path.split('/')[2];
            event.pathParameters = { voteId };
            const response = await submitVote(event);
            return {
                ...response,
                headers: { ...corsHeaders, ...(response.headers || {}) },
            };
        }
        if (httpMethod === 'GET' && path.startsWith('/results/')) {
            const voteId = path.split('/')[3]; // 결과를 조회하는 경로 처리
            event.pathParameters = { id: voteId }; // voteId를 pathParameters에 할당
            const response = await getResults(event); // getVoteById 함수 호출
            return {
                ...response,
                headers: { ...corsHeaders, ...(response.headers || {}) }, // CORS 헤더 추가
            };
        }
        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Route not found' }),
        };
    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
