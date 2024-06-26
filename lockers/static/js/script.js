document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded.');
    
    let lockersData = localStorage.getItem('lockersData') ? 
                      JSON.parse(localStorage.getItem('lockersData')) : 
                      {
                          '1F - 1': Array.from({ length: 32 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
                          '1F - 2': Array.from({ length: 30 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null })),
                          '2F': Array.from({ length: 24 }, (_, i) => ({ number: i + 1, isOccupied: false, user: null }))
                      };

    function saveLockerData() {
        localStorage.setItem('lockersData', JSON.stringify(lockersData));
    }
    // Load notification data from local storage or initialize as an empty array.
    let notifications = localStorage.getItem('notifications') ? 
                        JSON.parse(localStorage.getItem('notifications')) : 
                        [];
    // Function to save notification data to local storage.
    function saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }

    let isLockerSelected = isUserHasLocker(username);

    window.showFloor = function(floor) {
        console.log(`Showing floor: ${floor}`);
        var floors = ['1F - 1', '2F', '1F - 2'];
        floors.forEach(function(f) {
            document.getElementById('btn-' + f).classList.remove('active');
        });
        document.getElementById('btn-' + floor).classList.add('active');
        renderLockers(floor);
    }

    //Render the locker corresponding to the given floor on the screen.
    function renderLockers(floor) {
        console.log(`Rendering lockers for floor: ${floor}`);
        const container = document.getElementById('lockers-container');
        container.innerHTML = '';

        const table = document.createElement('table');
        const data = lockersData[floor];
        let row;

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
                event.stopPropagation(); // Prevent event propagation to higher DOM elements
                lockerButtonClicked(button, locker); // Call function when locker button is clicked
            };
            cell.appendChild(button);
            row.appendChild(cell);
        });

        container.appendChild(table);
    }

    // Handles locker button click events
    function lockerButtonClicked(button, locker) {
        if (locker.isOccupied && locker.user !== username) {
            alert("This locker is occupied by another user."); // Alert if locker is occupied by another user
            return;
        }

        if (locker.isOccupied && locker.user === username) {
            showActionButtons(button, locker); // Show options if locker is occupied by the current user
        } else if (isLockerSelected) {
            alert("You already have a locker assigned."); // Alert if user already has a locker
        } else if (!locker.isOccupied) {
            locker.isOccupied = true;
            locker.user = username;
            button.classList.add('occupied'); // Change button style to indicate occupation
            button.textContent = `${locker.user} ${locker.number}`;
            button.style.backgroundColor = '#dcdcdc';
            isLockerSelected = true;
            saveLockerData();
            localStorage.setItem(`isLockerSelected_${username}`, 'true'); // Save state to localStorage
        }
    }
    //To manages the action buttons (Gift, Exchange, Empty) displayed when a user clicks on a locker button.
    function showActionButtons(button, locker) {
        const existingBanner = document.querySelector('.action-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-banner';
        actionContainer.onclick = function(event) {
            event.stopPropagation();
        };

        addButtonsToActionContainer(actionContainer, locker, button);

        document.body.appendChild(actionContainer);
        positionActionBanner(button, actionContainer);

        document.body.addEventListener('click', function(event) {
            if (!actionContainer.contains(event.target)) {
                actionContainer.remove();
            }
        }, { once: true });
    }
    //To add Gift, Exchange, and Empty buttons to the action container.
    function addButtonsToActionContainer(container, locker, button) {
        const giftButton = document.createElement('button');
        giftButton.textContent = 'Gift';
        giftButton.onclick = function() {
            const recipient = prompt("Enter the recipient's ID:");
            if (recipient) {
                if (!isValidUser(recipient)) {
                    alert("Invalid user ID. Please try again.");
                } else if (isUserHasLocker(recipient)) {
                    alert("The user already has a locker assigned.");
                } else {
                    sendGiftRequest(locker, recipient);
                    alert(`Gift request sent to ${recipient}`);
                }
            }
        };
        container.appendChild(giftButton);

        const swapButton = document.createElement('button');
        swapButton.textContent = 'Exchange';
        swapButton.onclick = function() {
            const otherPerson = prompt("Enter the ID of the person you want to swap with:");
            if (otherPerson) {
                const theirLocker = getLockerByUser(otherPerson);
                if (theirLocker) {
                    sendSwapRequest(locker, theirLocker);
                } else {
                    alert("The specified user does not have a locker.");
                }
            }
        };
        container.appendChild(swapButton);

        const emptyButton = document.createElement('button');
        emptyButton.textContent = 'Empty';
        emptyButton.onclick = () => emptyButtonClicked(locker, button);
        container.appendChild(emptyButton);
    }

    // Function to handle emptying a locker
    function emptyButtonClicked(locker, button) {
        locker.isOccupied = false; // Mark the locker as unoccupied
        locker.user = null; // Remove any user associated with this locker
        button.classList.remove('occupied'); // Update the button's style to indicate it's available
        button.textContent = locker.number; // Display only the locker number
        button.style.backgroundColor = ''; // Reset the background color
        isLockerSelected = false; // Update the state to reflect that the user has no selected locker
        saveLockerData(); // Save the updated locker data to local storage

        const actionBanner = document.querySelector('.action-banner');
        if (actionBanner) {
            actionBanner.remove(); // Remove any action banners from the view
        }
        localStorage.setItem(`isLockerSelected_${username}`, 'false'); // Update local storage to indicate no locker is selected
    
    }

     //To set the position of the action banner.
    function positionActionBanner(button, container) {
        const rect = button.getBoundingClientRect();
        container.style.position = 'absolute';
        container.style.top = `${rect.bottom + window.scrollY}px`;
        container.style.left = `${rect.left + window.scrollX}px`;
        container.style.zIndex = 1000;
    }

    function isUserHasLocker(username) {
        for (let floor in lockersData) {
            if (lockersData[floor].some(locker => locker.user === username)) {
                return true;
            }
        }
        return false;
    }

    function isValidUser(username) {
        // Implement your logic to check if the user is valid.
        // This could be a call to your server or a lookup in a local storage list of valid users.
        const validUsers = ["22101989", "22102001", "22102003", "22102007","10101010"]; // Example list of valid users
        return validUsers.includes(username);
    }

    // Assign the locker to the recipient user
    function giftLockerToUser(locker, recipient) {
        locker.user = recipient;
        isLockerSelected = false;
        localStorage.setItem(`isLockerSelected_${username}`, 'false');
        saveLockerData();
    }


    // Send a gift request notification
    function sendGiftRequest(locker, recipient) {
        const notification = {
            type: 'gift',
            from: locker.user,
            to: recipient,
            lockerNumber: locker.number,
            floor: getFloorOfLocker(locker),
            message: `Gift request from ${locker.user} for locker ${locker.number}`,
            read: false,
            accepted: false
        };

        notifications.push(notification);
        saveNotifications();
        console.log('Gift request sent:', notification); // Debug log
    }


    // Send a swap request notification
    function sendSwapRequest(myLocker, theirLocker) {
        const notification = {
            type: 'swap',
            from: myLocker.user,
            to: theirLocker.user,
            myLocker: myLocker.number,
            theirLocker: theirLocker.number,
            floor: getFloorOfLocker(myLocker),
            message: `Swap request from ${myLocker.user} for locker ${myLocker.number} with your locker ${theirLocker.number}`,
            read: false,
            accepted: false
        };

        notifications.push(notification);
        saveNotifications();
        console.log('Swap request sent:', notification); // Debug log
        alert(`Swap request sent to ${theirLocker.user}`);
    }


    // Get the floor of the specified locker
    function getFloorOfLocker(locker) {
        for (let floor in lockersData) {
            if (lockersData[floor].includes(locker)) {
                return floor;
            }
        }
        return null;
    }
    // Function to handle the response to a notification. but not used
    function handleNotificationResponse(notificationId, isAccepted, notification) {
        console.log(`Notification response: ${isAccepted ? 'Accepted' : 'Declined'}`); 
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        let lockersData = JSON.parse(localStorage.getItem('lockersData'));
    
        if (isAccepted) {
            const floor = notification.floor;
            if (notification.type === 'swap') {
                const myLocker = lockersData[floor].find(l => l.number === notification.myLocker);
                const theirLocker = lockersData[floor].find(l => l.number === notification.theirLocker);
                if (myLocker && theirLocker) {
                    swapLockers(myLocker, theirLocker, floor, lockersData);
                } else {
                    alert("Unable to find the lockers for swap.");
                }
            } else if (notification.type === 'gift') {
                const locker = lockersData[floor].find(l => l.number === notification.lockerNumber);
                if (locker) {
                    giftLockerToUser(locker, notification.to, lockersData);
                } else {
                    alert("Unable to find the locker for gifting.");
                }
            }
        }
    
        // Remove the notification
        notifications.splice(notificationId, 1);
        localStorage.setItem('notifications', JSON.stringify(notifications));
    
        location.reload();
    }
    
    function swapLockers(myLocker, theirLocker, floor, lockersData) {
        // Swaps two lockers and updates their occupation status in the UI and storage
        console.log('Swapping lockers:', myLocker, theirLocker); // Debug
        const tempUser = myLocker.user;
        myLocker.user = theirLocker.user;
        theirLocker.user = tempUser;
    
        myLocker.isOccupied = !!myLocker.user; // Updates occupation status
        theirLocker.isOccupied = !!theirLocker.user; // Updates occupation status
    
        saveLockerData(lockersData); // Persists updated locker data to local storage
        updateLockerButton(myLocker, floor); // Refreshes the locker button display
        updateLockerButton(theirLocker, floor);
        alert(`Locker ${myLocker.number} has been swapped with locker ${theirLocker.number}`);
    }

    function getLockerByUser(username) {
        // Returns a locker associated with a specific user, or null if not found
        for (let floor in lockersData) {
            const locker = lockersData[floor].find(locker => locker.user === username);
            if (locker) {
                return locker;
            }
        }
        return null;
    }

    function updateLockerButton(locker, floor) {
        // Updates the display properties of a locker button based on its occupation status
        const lockerIndex = lockersData[floor].indexOf(locker); // Finds the index of the locker in the data array
        const container = document.getElementById('lockers-container');
        const button = container.getElementsByClassName('locker')[lockerIndex]; // Retrieves the button for the locker
        button.textContent = locker.isOccupied ? `${locker.user} - ${locker.number}` : locker.number; // Updates button text based on occupation status
        if (locker.isOccupied) {
            button.classList.add('occupied');
            button.style.backgroundColor = '#dcdcdc';
        } else {
            button.classList.remove('occupied');
            button.style.backgroundColor = '';
        }
    }

    showFloor('1F - 1');
});
