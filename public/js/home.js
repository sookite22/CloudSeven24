document.addEventListener('DOMContentLoaded', function () {
    const homeBtn = document.getElementById('home-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const createVoteBtn = document.getElementById('create-vote-btn');

    // 로그인 상태 확인 (기본값: false)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // 로그인 여부에 따라 홈 버튼 텍스트 및 동작 설정
    if (isLoggedIn) {
        homeBtn.textContent = 'Home';
        homeBtn.addEventListener('click', function () {
            if (sidebar) {
                sidebar.style.width = '250px'; // 네비게이션 바 열기
            }
        });
    } else {
        homeBtn.textContent = '로그인';
        homeBtn.addEventListener('click', () => {
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        });
        return; // 로그인하지 않은 경우 아래 코드 실행하지 않음
    }

    // 네비게이션 바 닫기
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            if (sidebar) {
                sidebar.style.width = '0'; // 네비게이션 바 닫기
            }
        });
    }

    // 로그아웃 버튼 클릭 시
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn'); // 로그인 상태 제거
            localStorage.removeItem('username'); // 저장된 사용자 이름 제거
            alert('로그아웃 되었습니다.');
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        });
    }

    // 새 투표 생성 버튼 클릭 시
    if (createVoteBtn) {
        createVoteBtn.addEventListener('click', () => {
            window.location.href = 'create.html'; // 새 투표 생성 페이지로 이동
        });
    }
});
