// 항목 추가 버튼 기능
document.getElementById('add-option-btn').addEventListener('click', function () {
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
    const removeBtn = newOption.querySelector('.remove-option-btn');
    removeBtn.addEventListener('click', function () {
        optionsContainer.removeChild(newOption);
        updateRemoveButtons(); // 삭제 버튼 가시성 업데이트
    });

    updateRemoveButtons(); // 삭제 버튼 가시성 업데이트
});

// 삭제 버튼 가시성 업데이트 함수
function updateRemoveButtons() {
    const optionItems = document.querySelectorAll('.option-item');
    const removeButtons = document.querySelectorAll('.remove-option-btn');

    // 항목이 1개만 남아있을 경우 삭제 버튼 숨김
    if (optionItems.length === 1) {
        removeButtons[0].style.display = 'none';
    } else {
        removeButtons.forEach(btn => btn.style.display = 'inline-block');
    }
}

// 투표 생성 폼 제출 시 처리
document.getElementById('create-vote').addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const options = Array.from(document.querySelectorAll('.option-input')).map(input => input.value);
    const deadline = document.getElementById('deadline').value;
    const selectionType = document.querySelector('input[name="selection"]:checked').value;

    if (!title || !deadline || options.length < 2) {
        alert("모든 필드를 입력하고 최소 2개의 항목을 추가해주세요!");
        return;
    }

    // 투표 데이터 생성
    const newVote = {
        id: Date.now(), // 고유 ID 생성
        title: title,
        deadline: deadline,
        options: options,
        selectionType: selectionType
    };

    // LocalStorage에 기존 투표 데이터 가져오기
    const votes = JSON.parse(localStorage.getItem('votes')) || [];
    votes.push(newVote); // 새 투표 추가
    localStorage.setItem('votes', JSON.stringify(votes)); // 업데이트

    console.log('투표 제목:', title);
    console.log('투표 항목:', options);
    console.log('선택 유형:', selectionType);
    console.log('제출 기한:', deadline);

    alert('투표가 생성되었습니다!');
    window.location.href = "main.html"; // 메인 페이지로 리디렉션
});

// 초기 로드 시 삭제 버튼 가시성 업데이트
updateRemoveButtons();
