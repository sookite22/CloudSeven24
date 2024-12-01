document.addEventListener('DOMContentLoaded', function () {
    // 로그인 여부 확인 (예시로 localStorage 사용)
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    // 새 투표 생성 버튼 클릭 이벤트
    const createVoteBtn = document.getElementById('create-vote-btn');
    if (createVoteBtn) {
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
    } else {
        console.error("Create vote button not found.");
    }

    // 로그인 버튼 클릭 시 로그인 페이지로 이동
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            console.log("Login button clicked."); // 디버깅용 로그
            window.location.href = 'login.html'; // 로그인 페이지로 리디렉션
        });
    } else {
        console.error("Login button not found.");
    }
});

const loginForm = document.getElementById("login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // 폼 제출 기본 동작 방지

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("your-login-api-endpoint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            console.log("API Response:", data); // API 응답 로그

            if (response.ok && data.message === "Login successful") {
                // 로그인 성공 시 home.html로 리디렉션
                console.log("Login successful, redirecting to home.html...");
                localStorage.setItem("loggedIn", "true"); // 로그인 상태 저장
                window.location.href = "home.html"; // 리디렉션
            } else {
                console.error("Login failed:", data.message);
                alert(data.message || "로그인 실패");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("로그인 중 오류가 발생했습니다.");
        }
    });
} else {
    console.error("Login form not found on the page.");
}
