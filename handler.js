const { createVote, getVoteById, getResults, submitVote, getAllVotes } = require('./function/votes');

// Lambda 핸들러
exports.handler = async (event) => {
    const { path, httpMethod, body } = event;

    try {
        if (httpMethod === 'GET' && path === '/votes') {
            return await getAllVotes();
        }
        if (httpMethod === 'POST' && path === '/votes') {
            return await createVote(event);
        }
        if (httpMethod === 'GET' && path.startsWith('/vote/')) {
            const voteId = path.split('/')[2];
            event.pathParameters = { voteId };
            return await getVoteById(event);
        }
        if (httpMethod === 'POST' && path.startsWith('/vote/')) {
            const voteId = path.split('/')[2];
            event.pathParameters = { voteId };
            return await submitVote(event);
        }
        if (httpMethod === 'GET' && path.startsWith('/results/')) {
            const voteId = path.split('/')[2];
            event.pathParameters = { voteId };
            return await getResults(event);
        }
    

        return { statusCode: 404, body: JSON.stringify({ message: 'Route not found' }) };
    } catch (error) {
        console.error('Error handling request:', error);
        return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};

