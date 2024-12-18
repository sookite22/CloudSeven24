const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // 사용자 입력값 가져오기
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const messageElement = document.getElementById('message');

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
        messageElement.textContent = '비밀번호가 일치하지 않습니다.';
        return;
    } else {
        messageElement.textContent = ''; // 에러 메시지 초기화
    }

    try {
        // API 요청 보내기
        const response = await fetch('http://3.36.91.73:3000/signup', { // EC2 IP로 변경
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('회원가입 성공!');
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        } else {
            messageElement.textContent = data.error || '회원가입 실패. 다시 시도해주세요.';
        }
    } catch (error) {
        console.error('회원가입 요청 중 오류 발생:', error);
        messageElement.textContent = '서버에 접속할 수 없습니다.';
    }
});
