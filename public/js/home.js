document.addEventListener('DOMContentLoaded', function () {
    const homeBtn = document.getElementById('home-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const createVoteBtn = document.getElementById('create-vote-btn');

    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // 로그인 여부에 따라 홈 버튼 텍스트 변경
    if (isLoggedIn === 'true') {
        homeBtn.textContent = 'Home';
    } else {
        homeBtn.textContent = '로그인';
        homeBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
        return; // 로그인하지 않은 경우 아래 코드는 실행하지 않음
    }

    // 네비게이션 바 열기
    homeBtn.addEventListener('click', function () {
        sidebar.style.width = '250px';
    });

    // 네비게이션 바 닫기
    closeBtn.addEventListener('click', function () {
        sidebar.style.width = '0';
    });

    // 로그아웃 버튼 클릭 시
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            alert('로그아웃 되었습니다.');
            window.location.href = 'login.html';
        });
    }

    // 새 투표 생성 버튼 클릭 시 vote.html로 이동
    if (createVoteBtn) {
        createVoteBtn.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    }
});
