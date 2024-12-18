// home.js
window.onload = function() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') || '사용자'; // 기본값 설정
    const loginBtn = document.getElementById("login-btn");

    if (token && userId && userId !== '사용자') {
        // 로그인 상태: 로그인 버튼을 사용자 아이디로 변경
        loginBtn.textContent = `${userId} 님`;
        loginBtn.onclick = function() {
            alert("이미 로그인되어 있습니다.");
        };
    } else {
        // 로그인되지 않은 상태
        loginBtn.textContent = '로그인';
        loginBtn.onclick = function() {
            window.location.href = 'login.html';
        };
    }

    // 로그아웃 버튼 처리
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.reload();
        });
    }

    // + 새 투표 생성 버튼 처리
    const createVoteBtn = document.getElementById("create-vote-btn");
    if (createVoteBtn) {
        createVoteBtn.addEventListener("click", function() {
            if (!localStorage.getItem('token')) {
                alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
                window.location.href = 'login.html'; // 로그인 페이지로 리다이렉트
            } else {
                alert('새로운 투표 방을 생성합니다!');
                // 새 투표 생성 로직 추가 가능
            }
        });
    }

    // 가짜 투표 리스트 추가
    loadFakeVoteList();
};

// 가짜 투표 리스트 함수
function loadFakeVoteList() {
    const fakeVotes = [
        { id: 1, title: "최고의 영화는?", deadline: "2024-12-31" },
        { id: 2, title: "점심 메뉴 투표", deadline: "2024-12-25" },
        { id: 3, title: "이번 주말 활동", deadline: "2024-12-28" },
        { id: 4, title: "개발자 도구 선호도", deadline: "2025-01-10" }
    ];

    fakeVotes.forEach(addVoteToList);
}

// 투표 항목을 리스트에 추가하는 함수
function addVoteToList(vote) {
    const voteList = document.getElementById('vote-items');
    const voteItem = document.createElement('li');
    voteItem.className = 'vote-item';
    voteItem.innerHTML = ` 
        <span class="vote-title">${vote.title}</span>
        <span class="vote-deadline">마감: ${vote.deadline}</span>
        <button class="vote-btn" onclick="alert('투표 ID: ${vote.id}')">투표 참여</button>
    `;
    voteList.appendChild(voteItem);
}

// 사이드바 열기/닫기 핸들러
document.getElementById("menu-btn").addEventListener("click", function() {
    document.getElementById("sidebar").classList.add("active");
});
document.getElementById("close-btn").addEventListener("click", function() {
    document.getElementById("sidebar").classList.remove("active");
});
