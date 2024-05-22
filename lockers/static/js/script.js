// static/js/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.'); // 디버깅을 위한 콘솔 로그

    const lockersData = {
        '1F': Array.from({ length: 32 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
        '1-2F': Array.from({ length: 30 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
        '2F': Array.from({ length: 24 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null }))
    };

    // 하나의 사물함이 선택되었는지 추적
    let isLockerSelected = false;

    window.showFloor = function(floor) {
        console.log(`Showing floor: ${floor}`); // 디버깅을 위한 콘솔 로그
        var floors = ['1F', '2F', '1-2F'];
        floors.forEach(function(f) {
            document.getElementById('btn-' + f).classList.remove('active');
        });
        document.getElementById('btn-' + floor).classList.add('active');
        renderLockers(floor);
    }

    function renderLockers(floor) {
        console.log(`Rendering lockers for floor: ${floor}`); // 디버깅을 위한 콘솔 로그
        const container = document.getElementById('lockers-container');
        container.innerHTML = ''; // 기존 내용 삭제

        const table = document.createElement('table');
        const data = lockersData[floor];
        let row;

        // 층마다 사물함을 몇 개씩 가로로 배치할지 결정하는 변수 추가
        const lockersPerRow = floor === '1F' ? 8 : 6;

        data.forEach((locker, index) => {
            if (index % lockersPerRow === 0) {
                row = document.createElement('tr');
                table.appendChild(row);
            }
            const cell = document.createElement('td');
            const button = document.createElement('button');
            button.className = 'locker';
            if (locker.isOccupied) {
                button.classList.add('occupied');
                button.textContent = `${locker.user} - ${locker.number}`;
            } else {
                button.textContent = locker.number;
            }
            
            button.onclick = () => {
                if (locker.isOccupied && locker.user === username) {
                    showActionButtons(button, locker);
                    return;
                }
                if (isLockerSelected && !locker.isOccupied) {
                    alert("Another locker is already selected. You cannot select more.");
                    return;
                }
                if (!locker.isOccupied) {
                    locker.isOccupied = true;
                    locker.user = username;
                    button.classList.add('occupied');
                    button.textContent = `${locker.user} - ${locker.number}`;
                    button.style.backgroundColor = '#dcdcdc';
                    isLockerSelected = true; // 사물함 선택 상태 업데이트
                }
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        container.appendChild(table);
    }

    function showActionButtons(button, locker) {
        const existingBanner = document.querySelector('.action-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-banner';

        const giftButton = document.createElement('button');
        giftButton.textContent = '사물함 선물하기';
        giftButton.onclick = () => alert(`You chose to gift locker ${locker.number}`);

        const swapButton = document.createElement('button');
        swapButton.textContent = '사물함 맞교환';
        swapButton.onclick = () => alert(`You chose to swap locker ${locker.number}`);

        const emptyButton = document.createElement('button');
        emptyButton.textContent = 'Empty';
        emptyButton.onclick = () => {
            locker.isOccupied = false;
            locker.user = null;
            button.classList.remove('occupied');
            button.textContent = locker.number;
            button.style.backgroundColor = ''; // 원래 색으로 돌아감
            actionContainer.remove();
            isLockerSelected = false; // 사물함 선택 해제
        };

        actionContainer.appendChild(giftButton);
        actionContainer.appendChild(swapButton);
        actionContainer.appendChild(emptyButton);

        // 배너를 사물함 칸 아래로 위치 조정
        const rect = button.getBoundingClientRect();
        actionContainer.style.position = 'absolute';
        actionContainer.style.top = `${rect.bottom + window.scrollY + 10}px`;
        actionContainer.style.left = `${rect.left + window.scrollX}px`;
        actionContainer.style.zIndex = 1000;

        document.body.appendChild(actionContainer);
    }

    // 기본으로 1층을 보여줍니다.
    showFloor('1F');
});