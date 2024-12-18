// vote.js
async function fetchVoteData() {
    const urlParams = new URLSearchParams(window.location.search);
    const voteId = urlParams.get('id');  // URL에서 투표 ID를 추출

    try {
        // 백엔드에서 투표 데이터를 가져옵니다 (예: GET 요청)
        const response = await fetch(`http://3.35.17.137:3000/vote/${voteId}`);
        const voteData = await response.json();

        // 가져온 데이터를 기반으로 화면 구성
        document.getElementById("vote-title").textContent = voteData.title;

        const voteOptionsContainer = document.getElementById("vote-options");
        voteOptionsContainer.innerHTML = '';  // 기존 내용 초기화

        // 옵션 생성 (단일 선택 또는 다중 선택)
        voteData.options.forEach((option, index) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "vote-option";
            
            const input = document.createElement("input");
            input.type = voteData.selectionType === "single" ? "radio" : "checkbox";
            input.name = "vote-option";
            input.value = option;
            input.id = `option-${index}`;
            
            const label = document.createElement("label");
            label.htmlFor = `option-${index}`;
            label.textContent = option;

            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            voteOptionsContainer.appendChild(optionDiv);
        });

        // 투표 기한 확인
        const currentTime = new Date().toISOString();
        const voteDeadline = new Date(voteData.deadline).toISOString();

        // 기한이 지나면 결과 보기 버튼 활성화
        if (currentTime > voteDeadline) {
            document.getElementById("view-results-btn").style.display = "block";  // 결과 보기 버튼 표시
        }
    } catch (error) {
        console.error('투표 데이터를 가져오는 중 오류 발생:', error);
    }
}

// 페이지가 로드되면 투표 데이터를 가져와 화면을 구성
window.onload = fetchVoteData;

// 투표 제출 이벤트 핸들러
document.getElementById("voteForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedOptions = [];
    document.querySelectorAll("input[name='vote-option']:checked").forEach((checkbox) => {
        selectedOptions.push(checkbox.value);
    });

    if (selectedOptions.length === 0) {
        alert("옵션을 선택하세요.");
        return;
    }

    const voteId = new URLSearchParams(window.location.search).get('id');

    try {
        const response = await fetch(`http://54.180.131.78:3000/vote/${voteId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ options: selectedOptions })
        });

        if (response.ok) {
            alert("투표가 완료되었습니다!");
            window.location.href = "home.html"; // 홈 페이지로 리디렉션
        } else {
            alert("투표 중 오류가 발생했습니다.");
        }
    } catch (error) {
        console.error("투표 요청 중 오류:", error);
    }
});

// 결과 보기 버튼 클릭 시, 기한 체크 후 결과 페이지로 리디렉션
function viewResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const voteId = urlParams.get('id');
    
    // 현재 시간과 기한을 비교하여, 기한이 지나지 않으면 경고 메시지 표시
    const currentTime = new Date().toISOString();
    const voteDeadline = new Date(voteData.deadline).toISOString();

    if (currentTime < voteDeadline) {
        alert("투표 기한이 지나지 않았습니다. 기한이 지나면 결과를 확인할 수 있습니다.");
    } else {
        window.location.href = `result.html?id=${voteId}`;  // 결과 페이지로 이동
    }
}
