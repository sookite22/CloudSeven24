const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://3.36.91.73:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        console.log('서버 응답 데이터:', data); // 서버 응답 디버깅용

        if (response.ok) {
            if (data.token && data.userId) {
                // JWT 토큰과 사용자 ID 저장
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                alert('로그인 성공!');
                window.location.href = 'home.html'; // 홈 페이지로 이동
            } else {
                alert('서버에서 필요한 데이터를 반환하지 않았습니다. 관리자에게 문의하세요.');
                console.error('누락된 필드:', data);
            }
        } else {
            document.getElementById('message').textContent = data.message || '로그인 실패. 다시 시도해주세요.';
        }
    } catch (error) {
        console.error('로그인 요청 중 오류:', error);
        document.getElementById('message').textContent = '서버에 접속할 수 없습니다.';
    }
});
