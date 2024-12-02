document.addEventListener('DOMContentLoaded', async function () {
    const optionsContainer = document.getElementById('options-container');
    const voteForm = document.getElementById('voteForm');

    // API URL (투표 옵션 가져오기)
    const fetchOptionsApiUrl = "https://07xbstlbu0.execute-api.ap-northeast-2.amazonaws.com/test/votes"; // API Gateway URL

    try {
        // 서버에서 투표 옵션 가져오기
        const response = await fetch(fetchOptionsApiUrl, {
            method: "GET",
        });

        if (response.ok) {
            const voteData = await response.json();
            console.log("투표 옵션 데이터:", voteData);

            // 옵션을 동적으로 추가
            voteData.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option-item');
                optionDiv.innerHTML = `
                    <label>
                        <input type="${voteData.selectionType === 'single' ? 'radio' : 'checkbox'}" 
                               name="voteOption" 
                               value="${option}" 
                               required>
                        ${option}
                    </label>
                `;
                optionsContainer.appendChild(optionDiv);
            });
        } else {
            const errorData = await response.json();
            console.error("옵션 가져오기 실패:", errorData);
            alert("옵션을 불러오는데 실패했습니다: " + (errorData.message || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("옵션 로드 중 오류 발생:", error);
        alert("서버와 통신하는 동안 오류가 발생했습니다.");
    }

    // 폼 제출 처리
    voteForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // 선택된 옵션 값 가져오기
        const selectedOptions = Array.from(document.querySelectorAll('input[name="voteOption"]:checked'))
            .map(input => input.value);

        if (selectedOptions.length === 0) {
            alert("적어도 하나의 옵션을 선택하세요.");
            return;
        }

        // 투표 데이터 전송
        const submitVoteApiUrl = "https://07xbstlbu0.execute-api.ap-northeast-2.amazonaws.com/test/votes"; // API Gateway URL
        try {
            const response = await fetch(submitVoteApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ selectedOptions }),
            });

            if (response.ok) {
                alert("투표가 성공적으로 완료되었습니다!");
                window.location.href = "results.html"; // 결과 페이지로 이동
            } else {
                const errorData = await response.json();
                console.error("투표 실패:", errorData);
                alert("투표 실패: " + (errorData.message || "알 수 없는 오류"));
            }
        } catch (error) {
            console.error("투표 제출 중 오류 발생:", error);
            alert("서버와 통신하는 동안 오류가 발생했습니다.");
        }
    });
});
