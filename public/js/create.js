// 항목 추가 버튼 기능
document.getElementById('add-option-btn').addEventListener('click', function() {
    const optionsContainer = document.getElementById('options-container');
    const optionCount = optionsContainer.querySelectorAll('.option-item').length + 1;
    
    const newOption = document.createElement('div');
    newOption.classList.add('option-item');
    newOption.innerHTML = `
        <input type="text" class="option-input" placeholder="항목 ${optionCount}" required>
        <button type="button" class="remove-option-btn">삭제</button>
    `;
    optionsContainer.appendChild(newOption);

    // 삭제 버튼 기능 추가
    newOption.querySelector('.remove-option-btn').addEventListener('click', function() {
        optionsContainer.removeChild(newOption);
    });
});

// 투표 생성 폼 제출 시 처리
document.getElementById('create-vote').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const options = Array.from(document.querySelectorAll('.option-input')).map(input => input.value);
    const deadline = document.getElementById('deadline').value;
    const selectionType = document.querySelector('input[name="selection"]:checked').value;

    // 유효성 검사
    if (!title || options.length === 0 || !deadline) {
        alert("모든 필드를 채워주세요.");
        return;
    }

    // API Gateway URL
    const apiUrl = "https://07xbstlbu0.execute-api.ap-northeast-2.amazonaws.com/test/votes"; // 정확한 API URL

    const voteData = {
        title,
        options: options.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}), // 옵션 초기값 설정
        deadline,
        selectionType,
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(voteData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("투표 생성 결과:", result);
            alert("투표가 성공적으로 생성되었습니다!");
            window.location.href = "home.html"; // 생성 후 홈으로 이동
        } else {
            const errorData = await response.json();
            console.error("투표 생성 실패:", errorData);
            alert("투표 생성 실패: " + (errorData.message || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("서버 요청 중 오류 발생:", error);
        alert("서버와 통신하는 동안 오류가 발생했습니다.");
    }
});
