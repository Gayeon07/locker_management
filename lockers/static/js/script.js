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

    // Check if a locker is already selected by the current user on page load
    let isLockerSelected = localStorage.getItem(`isLockerSelected_${username}`) === 'true';

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
        if (locker.isOccupied && locker.user !== username) {
            alert("This locker is occupied by another user.");
            return;
        }

        if (locker.isOccupied && locker.user === username) {
            showActionButtons(button, locker);
        } else if (isLockerSelected) {
            alert("You have already selected another locker.");
        } else if (!locker.isOccupied) {
            locker.isOccupied = true;
            locker.user = username;
            button.classList.add('occupied');
            button.textContent = `${locker.user} ${locker.number}`;
            button.style.backgroundColor = '#dcdcdc';
            isLockerSelected = true;
            saveLockerData(); // Save changes to localStorage
            localStorage.setItem(`isLockerSelected_${username}`, 'true'); // Save the selection state for the current user
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
                if (isUserHasLocker(recipient)) {
                    alert("The user already has a locker assigned.");
                } else {
                    giftLockerToUser(locker, recipient, button);
                    alert(`Locker ${locker.number} has been gifted to ${recipient}`);
                }
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
        emptyButton.onclick = () => emptyButtonClicked(locker, button);
        container.appendChild(emptyButton);
    }

    function emptyButtonClicked(locker, button) {
        locker.isOccupied = false;
        locker.user = null;
        button.classList.remove('occupied');
        button.textContent = locker.number;
        button.style.backgroundColor = '';
        isLockerSelected = false;
        saveLockerData();  // Save the changes to localStorage
    
        // Remove the action banner from the view
        const actionBanner = document.querySelector('.action-banner');
        if (actionBanner) {
            actionBanner.remove();
        }
        localStorage.setItem(`isLockerSelected_${username}`, 'false');  // Reset the selection state for the current user
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
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ recipient_id: recipientId, message: message })
        }).then(response => response.json())
          .then(data => {
            if(data.status === 'success') {
                alert('Notification sent successfully.');
            }
        });
    }
    
    document.querySelectorAll('.notification').forEach(notification => {
        notification.addEventListener('click', () => {
            const notificationId = notification.dataset.id;
            fetch(`/mark-notification-read/${notificationId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                }
            }).then(response => {
                if (response.ok) {
                    notification.classList.remove('unread');
                    notification.classList.add('read');
                }
            });
        });
    });
    
    // Check if a user already has a locker assigned
    function isUserHasLocker(username) {
        for (let floor in lockersData) {
            if (lockersData[floor].some(locker => locker.user === username)) {
                return true;
            }
        }
        return false;
    }

    // Gift locker to another user
    function giftLockerToUser(locker, recipient, button) {
        locker.user = recipient;
        isLockerSelected = false;
        sessionStorage.setItem(`isLockerSelected_${username}`, 'false');
        button.textContent = `${locker.user} - ${locker.number}`;
        button.classList.add('occupied');
        button.style.backgroundColor = '#dcdcdc';
        saveLockerData();
    }

    // Get CSRF token from cookie
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === 'csrftoken=') {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 기본으로 1층을 보여줍니다.
    showFloor('1F - 1');
});
