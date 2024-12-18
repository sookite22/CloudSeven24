// result.js
async function fetchResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const voteId = urlParams.get('id');  // URL에서 투표 ID를 추출

    try {
        // 백엔드에서 투표 결과 데이터를 가져옵니다 (예: GET 요청)
        const response = await fetch(`http://54.180.131.78:3000/vote/${voteId}/results`);
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('결과를 가져오는 중 오류 발생:', error);
    }
}

function displayResults(data) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // 이전 결과 지우기

    // 각 항목의 결과 표시
    for (const [option, count] of Object.entries(data)) {
        const percentage = ((count / getTotalVotes(data)) * 100).toFixed(2);  // 백분율 계산
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-bar';
        resultDiv.style.width = `${percentage}%`;  // 백분율에 맞게 너비 설정
        resultDiv.textContent = `${option}: ${count}표 (${percentage}%)`;
        container.appendChild(resultDiv);
    }
}

function getTotalVotes(data) {
    // 전체 투표 수 계산
    return Object.values(data).reduce((acc, count) => acc + count, 0);
}

// 페이지 로드 시 투표 결과 가져오기
window.onload = fetchResults;
