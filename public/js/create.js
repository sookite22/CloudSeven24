// create.js
document.getElementById("add-option-btn").addEventListener("click", function() {
    const optionsContainer = document.getElementById("options-container");
    const newOption = document.createElement("div");
    newOption.classList.add("option-item");

    newOption.innerHTML = `
        <input type="text" class="option-input" placeholder="항목" required>
        <button type="button" class="remove-option-btn">삭제</button>
    `;

    // 삭제 버튼 클릭 시 항목 삭제
    newOption.querySelector(".remove-option-btn").addEventListener("click", function() {
        optionsContainer.removeChild(newOption);
    });

    optionsContainer.appendChild(newOption);
});

const createVoteForm = document.getElementById("create-vote");
createVoteForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    // 입력된 데이터 가져오기
    const title = document.getElementById("title").value;
    const options = [];
    document.querySelectorAll(".option-input").forEach(input => options.push(input.value));
    const selectionType = document.querySelector('input[name="selection"]:checked').value;
    const deadline = document.getElementById("deadline").value;
    const token = localStorage.getItem('token');  // 로그인한 사용자의 JWT 토큰

    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const newVoteData = {
        title,
        options,
        selectionType,
        deadline
    };

    try {
        // 투표 생성 API 요청 (Lambda 함수에 전송)
        const response = await fetch('http://54.180.131.78:3000/create-vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // JWT 토큰 포함
            },
            body: JSON.stringify(newVoteData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('새로운 투표 방이 생성되었습니다!');
            window.location.href = 'home.html';  // 홈 페이지로 리디렉션
        } else {
            alert(result.message || '투표 방 생성 실패. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('오류 발생:', error);
        alert('서버와 연결하는 데 문제가 발생했습니다.');
    }
});
