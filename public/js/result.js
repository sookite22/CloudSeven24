// 예시 데이터
const voteData = {
    title: "좋아하는 색상 투표",
    options: [
        { name: "빨강", votes: 40 },
        { name: "파랑", votes: 25 },
        { name: "초록", votes: 35 }
    ]
};

// 투표 데이터 시각화
const ctx = document.getElementById('result-chart').getContext('2d');
const chartData = {
    labels: voteData.options.map(option => option.name),
    datasets: [{
        data: voteData.options.map(option => option.votes),
        backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0']
    }]
};

const voteChart = new Chart(ctx, {
    type: 'pie',
    data: chartData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const totalVotes = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / totalVotes) * 100).toFixed(1);
                        return `${context.label}: ${context.raw}표 (${percentage}%)`;
                    }
                }
            }
        }
    }
});

// 페이지 초기화
document.getElementById('vote-title').innerText = voteData.title;
document.getElementById('total-votes-count').innerText = voteData.options.reduce((sum, option) => sum + option.votes, 0);

// 실시간 업데이트 예시 (AWS 연동 시 WebSocket이나 AppSync 대체 가능)
setInterval(() => {
    // 새 데이터로 업데이트
    const randomIndex = Math.floor(Math.random() * voteData.options.length);
    voteData.options[randomIndex].votes += Math.floor(Math.random() * 5); // 랜덤 증가

    // 데이터 갱신
    voteChart.data.datasets[0].data = voteData.options.map(option => option.votes);
    voteChart.update();

    // 총 투표 수 갱신
    document.getElementById('total-votes-count').innerText = voteData.options.reduce((sum, option) => sum + option.votes, 0);
}, 5000); // 5초 간격으로 업데이트
