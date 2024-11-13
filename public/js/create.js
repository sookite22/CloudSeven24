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
document.getElementById('create-vote').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const options = Array.from(document.querySelectorAll('.option-input')).map(input => input.value);
    const deadline = document.getElementById('deadline').value;
    const selectionType = document.querySelector('input[name="selection"]:checked').value;

    console.log('투표 제목:', title);
    console.log('투표 항목:', options);
    console.log('선택 유형:', selectionType);
    console.log('제출 기한:', deadline);
    
    alert('투표가 생성되었습니다!');
    // 이후 서버로 데이터 전송 로직 추가 필요
});
