// static/js/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.'); // 디버깅을 위한 콘솔 로그

    const lockersData = {
        '1F': Array.from({ length: 12 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
        '2F': Array.from({ length: 12 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null }))
    };

    window.showFloor = function(floor) {
        console.log(`Showing floor: ${floor}`); // 디버깅을 위한 콘솔 로그
        var floors = ['1F', '2F'];
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

        data.forEach((locker, index) => {
            if (index % 3 === 0) {
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
                if (!locker.isOccupied) {
                    locker.isOccupied = true;
                    locker.user = username;
                    button.classList.add('occupied');
                    button.textContent = `${locker.user} - ${locker.number}`;
                    button.style.backgroundColor = '#dcdcdc'; // 배정된 사물함은 회색으로 표시
                } else if (locker.user === username) {
                    showActionButtons(button, locker);
                } else {
                    alert(`Locker ${locker.number} is already occupied by ${locker.user}.`);
                }
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        container.appendChild(table);
    }

    function showActionButtons(button, locker) {
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-buttons';

        const giftButton = document.createElement('button');
        giftButton.textContent = 'Gift';
        giftButton.onclick = () => alert(`You chose to gift locker ${locker.number}`);

        const swapButton = document.createElement('button');
        swapButton.textContent = 'Exchange';
        swapButton.onclick = () => alert(`You chose to swap locker ${locker.number}`);

        actionContainer.appendChild(giftButton);
        actionContainer.appendChild(swapButton);
        
        button.parentElement.appendChild(actionContainer);
    }

    // 기본으로 1층을 보여줍니다.
    showFloor('1F');
});

