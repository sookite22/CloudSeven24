document.addEventListener('DOMContentLoaded', async function () {
    const homeBtn = document.getElementById('home-btn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const voteList = document.getElementById('vote-items');

    // 로그인 상태 확인 및 초기화
    const initializeUserState = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            homeBtn.textContent = 'Home';
        } else {
            homeBtn.textContent = '로그인';
            homeBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
            return false; // 로그인하지 않은 경우 추가 초기화 생략
        }
        return true;
    };

    // 네비게이션 바 이벤트 설정
    const setupSidebar = () => {
        homeBtn.addEventListener('click', () => {
            sidebar.style.width = '250px';
        });

        closeBtn.addEventListener('click', () => {
            sidebar.style.width = '0';
        });
    };

    // 로그아웃 기능 설정
    const setupLogout = () => {
        logoutBtn?.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            alert('로그아웃 되었습니다.');
            window.location.href = 'main.html';
        });
    };

    // 서버에서 투표 데이터를 가져오는 함수
    const fetchVotes = async () => {
        try {
            const response = await fetch('/api/votes'); // 서버 API 호출
            if (!response.ok) throw new Error('Failed to fetch votes');
            return await response.json(); // JSON 데이터 반환
        } catch (error) {
            console.error('Error fetching votes:', error);
            return [];
        }
    };

    // 투표 리스트 렌더링 함수
    const renderVotes = async () => {
        const votes = await fetchVotes();
        voteList.innerHTML = ''; // 기존 리스트 초기화

        votes.forEach(vote => {
            // title이 없는 항목은 건너뜁니다.
            if (!vote.title) return;
    
            const listItem = document.createElement('li');
            listItem.className = 'vote-item';
            listItem.innerHTML = `
                <span class="vote-title">${vote.title}</span>
                <span class="vote-deadline">마감: ${vote.deadline}</span>
                <button class="vote-btn">투표 참여</button>
            `;
            voteList.appendChild(listItem);
            
            // 투표 참여 버튼 클릭 이벤트
            const voteButton = listItem.querySelector('.vote-btn');
            voteButton.addEventListener('click', () => {
                window.location.href = `vote.html?voteId=${vote.id}`;
        });
        });

        // 새 투표 생성 버튼 추가
        const createVoteItem = document.createElement('li');
        createVoteItem.className = 'vote-item create-new';
        createVoteItem.id = 'create-vote-btn';
        createVoteItem.innerHTML = `
            <span class="vote-title">+ 새 투표 생성</span>
        `;
        voteList.appendChild(createVoteItem);

        // 새 투표 생성 버튼 클릭 이벤트
        createVoteItem.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    };

    // 초기화 수행
    if (initializeUserState()) {
        setupSidebar();
        setupLogout();
        await renderVotes(); // 투표 리스트 렌더링
    }
});
