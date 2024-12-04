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


document.getElementById('create-vote').addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const options = Array.from(document.querySelectorAll('.option-input')).map(input => input.value);
    const deadline = document.getElementById('deadline').value;
    const selectionType = document.querySelector('input[name="selection"]:checked').value;

    if (!title || options.length === 0 || !deadline || !selectionType) {
        alert('모든 필드를 입력하세요.');
        return;
    }

    try {
        const response = await fetch('/api/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, options, deadline, selectionType }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('투표가 성공적으로 생성되었습니다!');
            window.location.href = 'home.html'; // Home 페이지로 리디렉션
        } else {
            alert(`오류: ${data.error}`);
        }
    } catch (error) {
        console.error('Fetch 에러:', error);
        alert('서버 오류로 투표를 생성하지 못했습니다.');
    }
});