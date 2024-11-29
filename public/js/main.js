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


});
