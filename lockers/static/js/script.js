// static/js/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.'); // 디버깅을 위한 콘솔 로그

    const lockersData = {
        '1F': Array.from({ length: 12 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
        '2F': Array.from({ length: 12 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null }))
    };

    function getUserName() {
        // 간단한 사용자 이름을 입력받는 함수
        return prompt("Enter your username:");
    }

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
                    const userName = getUserName();
                    if (userName) {
                        locker.isOccupied = true;
                        locker.user = userName;
                        button.classList.add('occupied');
                        button.textContent = `${locker.user} - ${locker.number}`;
                        button.style.backgroundColor = '#dcdcdc'; // 배정된 사물함은 회색으로 표시
                    }
                } else {
                    alert(`Locker ${locker.number} is already occupied by ${locker.user}.`);
                }
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        container.appendChild(table);
    }

    // 기본으로 1층을 보여줍니다.
    showFloor('1F');
});
