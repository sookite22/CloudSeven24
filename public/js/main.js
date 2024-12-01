document.addEventListener('DOMContentLoaded', function () {
    // 로그인 여부 확인 (예시로 localStorage 사용)
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    // 새 투표 생성 버튼 클릭 이벤트
    const createVoteBtn = document.getElementById('create-vote-btn');
    createVoteBtn.addEventListener('click', function () {
        if (isLoggedIn) {
            // 로그인이 되어 있다면 투표 생성 페이지로 이동
            window.location.href = 'create.html';
        } else {
            // 로그인이 안 되어 있으면 로그인 페이지로 이동하고 알림 표시
            alert('로그인 후 투표를 생성할 수 있습니다.');
            window.location.href = 'login.html';
        }
    });

    // 로그인 버튼 클릭 시 로그인 페이지로 이동
    const loginBtn = document.getElementById('login-btn');
    loginBtn.addEventListener('click', function () {
        window.location.href = 'login.html';
    });

    // 저장된 투표 데이터를 불러와 리스트 표시
    const voteListContainer = document.getElementById('vote-items');
    const votes = JSON.parse(localStorage.getItem('votes')) || [];

    // 투표 데이터를 화면에 추가
    votes.forEach(vote => {
        const voteItem = document.createElement('li');
        voteItem.classList.add('vote-item');
        voteItem.innerHTML = `
            <div class="vote-content">
                <span class="vote-title">${vote.title}</span>
                <span class="vote-deadline">마감: ${vote.deadline}</span>
            </div>
            <button class="vote-btn">투표 참여</button>
        `;

        // "투표 참여" 버튼 클릭 이벤트 추가
        const voteBtn = voteItem.querySelector('.vote-btn');
        voteBtn.addEventListener('click', function () {
            if (isLoggedIn) {
                // 선택된 투표 ID를 저장하고 투표 페이지로 이동
                localStorage.setItem('currentVoteId', vote.id);
                window.location.href = 'vote.html'; // 투표 참여 페이지로 이동
            } else {
                alert('로그인 후 투표에 참여할 수 있습니다.');
                window.location.href = 'login.html';
            }
        });

        voteListContainer.appendChild(voteItem);
    });
});
