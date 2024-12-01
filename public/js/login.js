document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // 폼 기본 동작(페이지 새로고침) 방지

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // 유효성 검사
    if (!username || !password) {
        alert("사용자 이름과 비밀번호를 입력하세요.");
        return;
    }

    try {
        // AWS API Gateway URL
        const apiUrl = "https://0tzdwtrc28.execute-api.ap-northeast-2.amazonaws.com/prod/loginUser";

        console.log("로그인 요청 시작:", { username });

        // Lambda 함수로 요청 전송
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        console.log("응답 수신:", response);

        // 응답 처리
        const result = await response.json();

        if (response.ok) {
            console.log("로그인 성공:", result);
            alert("로그인 성공: " + result.message);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            window.location.href = "home.html"; // 로그인 성공 후 메인 페이지로 리디렉션
        } else if (response.status === 401) {
            alert("로그인 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다.");
        } else if (response.status === 404) {
            alert("로그인 실패: 사용자를 찾을 수 없습니다.");
        } else {
            console.error("로그인 실패, 상태코드:", response.status, "응답 내용:", result);
            alert("로그인 실패: " + (result.message || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("Fetch error 발생:", error);
        alert("서버와 통신하는 동안 오류가 발생했습니다.");
    }
});
