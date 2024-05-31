// static/js/scripts.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.'); // 디버깅을 위한 콘솔 로그

    // Load or initialize locker data from localStorage
    let lockersData = localStorage.getItem('lockersData') ?
                      JSON.parse(localStorage.getItem('lockersData')) :
                      {
                          '1F - 1': Array.from({ length: 32 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
                          '1F - 2': Array.from({ length: 30 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
                          '2F': Array.from({ length: 24 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null }))
                      };

    // Function to save locker data to localStorage
    function saveLockerData() {
        localStorage.setItem('lockersData', JSON.stringify(lockersData));
    }

    // 하나의 사물함이 선택되었는지 추적
    let isLockerSelected = false;

    window.showFloor = function(floor) {
        console.log(`Showing floor: ${floor}`); // 디버깅을 위한 콘솔 로그
        var floors = ['1F - 1', '2F', '1F - 2'];
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
        const lockersPerRow = floor === '1F - 1' ? 8 : 6;

        data.forEach((locker, index) => {
            if (index % lockersPerRow === 0) {
                row = document.createElement('tr');
                table.appendChild(row);
            }
            const cell = document.createElement('td');
            const button = document.createElement('button');
            button.className = 'locker';
            button.textContent = locker.isOccupied ? `${locker.user} - ${locker.number}` : locker.number;
            button.onclick = function(event) {
                event.stopPropagation(); // Prevent event from bubbling to higher elements
                lockerButtonClicked(button, locker);
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        container.appendChild(table);
    }

    function lockerButtonClicked(button, locker) {
        if (locker.isOccupied && locker.user === username) {
            showActionButtons(button, locker);
        } else if (isLockerSelected) {
            alert("Another locker is already selected. You cannot select more.");
        } else if (!locker.isOccupied) {
            locker.isOccupied = true;
            locker.user = username;
            button.classList.add('occupied');
            button.textContent = `${locker.user} ${locker.number}`;
            button.style.backgroundColor = '#dcdcdc';
            isLockerSelected = true;
            saveLockerData(); // Save changes to localStorage
        }
    }


    function showActionButtons(button, locker) {
        const existingBanner = document.querySelector('.action-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-banner';
        actionContainer.onclick = function(event) {
            event.stopPropagation(); // Prevent click event from propagating to higher elements
        };

        addButtonsToActionContainer(actionContainer, locker, button);

        document.body.appendChild(actionContainer);
        positionActionBanner(button, actionContainer);

        // Add event listener to body to remove banner when clicking outside of it
        document.body.addEventListener('click', function(event) {
            if (!actionContainer.contains(event.target)) {
                actionContainer.remove();
            }
        }, { once: true }); // Listener will auto-remove after execution
    }

    function addButtonsToActionContainer(container, locker, button) {
        const giftButton = document.createElement('button');
        giftButton.textContent = 'Gift';
        giftButton.onclick = function() {
            const recipient = prompt("Enter the recipient's ID:");
            if (recipient) {
                alert(`You chose to gift locker ${locker.number} to ${recipient}`);
            }
        };
        container.appendChild(giftButton);

        const swapButton = document.createElement('button');
        swapButton.textContent = 'Exchange';
        swapButton.onclick = function() {
            const otherPerson = prompt("Enter the ID of the person you want to swap with:");
            if (otherPerson) {
                alert(`You chose to swap locker ${locker.number} with ${otherPerson}`);
            }
        };
        container.appendChild(swapButton);

        const emptyButton = document.createElement('button');
        emptyButton.textContent = 'Empty';
        emptyButton.onclick = () => {
            locker.isOccupied = false;
            locker.user = null;
            button.classList.remove('occupied');
            button.textContent = locker.number;
            button.style.backgroundColor = '';
            container.remove();
            isLockerSelected = false;
        };
        container.appendChild(emptyButton);
    }

    function positionActionBanner(button, container) {
        const rect = button.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.zIndex = 1000;
    }



    function sendNotification(recipientId, message) {
        fetch('/send-notification/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ recipient_id: recipientId, message: message })
        }).then(response => response.json())
          .then(data => {
            if(data.status === 'success') {
                alert('알림이 성공적으로 전송되었습니다.');
            }
        });
    }
    
    document.querySelectorAll('.notification').forEach(notification => {
        notification.addEventListener('click', () => {
            const notificationId = notification.dataset.id;
            fetch(`/mark-notification-read/${notificationId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken
                }
            }).then(response => {
                if (response.ok) {
                    notification.classList.remove('unread');
                    notification.classList.add('read');
                }
            });
        });
    });
    

    // 기본으로 1층을 보여줍니다.
    showFloor('1F - 1');
});