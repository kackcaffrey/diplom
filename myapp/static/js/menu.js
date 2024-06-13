document.addEventListener("DOMContentLoaded", function() {
    const addTask = document.getElementById('add-task');
    const taskInput = document.getElementById('task-input');
    const plusIcon = document.querySelector('.plus-icon');
    const datePicker = document.querySelector('.date-picker');
    const dateInput = document.getElementById('custom-date');

    if (addTask && taskInput && plusIcon && datePicker && dateInput) {
        function expandDetails() {
            if (!addTask.classList.contains('expanded')) {
                addTask.classList.add('expanded');
            }
        }

        plusIcon.addEventListener('click', function() {
            addTask.classList.toggle('expanded');
            if (!datePicker.classList.contains('hidden')) {
                datePicker.classList.add('hidden');
                datePicker.classList.remove('visible');
            }
        });

        taskInput.addEventListener('click', function(event) {
            expandDetails();
            event.stopPropagation();
        });
    } else {
        console.error("One or more elements (add-task, task-input, plus-icon, date-picker, custom-date) are not found");
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById('search-input');
    const clearIcon = document.querySelector('.clear-icon');

    if (searchInput && clearIcon) {
        searchInput.addEventListener('input', function() {
            clearIcon.style.display = searchInput.value.length > 0 ? 'block' : 'none';
        });

        clearIcon.addEventListener('click', function() {
            searchInput.value = '';
            clearIcon.style.display = 'none';
            searchInput.focus();
        });
    } else {
        console.error("Elements 'search-input' or 'clear-icon' not found");
    }
});

function toggleSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        if(menu.style.display === "block") {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
            const profileMenu = document.getElementById('profile-menu');
            if (profileMenu) {
                profileMenu.style.display = "none";
            } else {
                console.error("Element 'profile-menu' not found");
            }
        }
    } else {
        console.error("Element 'settings-menu' not found");
    }
}

function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (menu) {
        if(menu.style.display === "block") {
            menu.style.display = "none";
        } else {
            menu.style.display = "block";
            const settingsMenu = document.getElementById('settings-menu');
            if (settingsMenu) {
                settingsMenu.style.display = "none";
            } else {
                console.error("Element 'settings-menu' not found");
            }
        }
    } else {
        console.error("Element 'profile-menu' not found");
    }
}

function closeSettingsMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        menu.style.display = "none";
    } else {
        console.error("Element 'settings-menu' not found");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Add styles for input fields and buttons
    const style = document.createElement('style');
    style.textContent = `
        #settings-menu input[type="text"], 
        #settings-menu select, 
        #settings-menu input[type="number"] {
            background-color: #262829;
            color: #ffffff;
            border: 1px solid #555555;
            border-radius: 5px;
            padding: 10px;
            margin-right: 10px;
        }

        #settings-menu input[type="text"]::placeholder {
            color: #888888;
        }

        #settings-menu button {
            background-color: #262829;
            color: #ffffff;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            cursor: pointer;
        }

        #settings-menu button:active {
            background-color: #003d6b;
        }

        .notification-container {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #262829;
            color: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            transition: opacity 1s;
        }

        .notification-container + .notification-container {
            margin-top: 10px; /* Отступ между уведомлениями */
        }

        .notification-container.fade-out {
            opacity: 0;
        }

        .notification-message {
            margin: 0;
        }
    `;
    document.head.appendChild(style);

    const saveButton = document.getElementById('save-telegram-username');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const telegramNickInput = document.getElementById('telegram-nick-input');
            if (telegramNickInput) {
                const telegramNick = telegramNickInput.value.trim();

                if (telegramNick !== '' && telegramNick.startsWith('@')) {
                    saveTelegramNick(telegramNick);
                } else {
                    alert('Введите Telegram ник в формате @nick');
                }
            } else {
                console.error("Element 'telegram-nick-input' not found");
            }
        });

        function saveTelegramNick(nick) {
            fetch('/myapp/save-telegram-nick/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ telegram_nick: nick })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Telegram ник сохранён');
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Удалить';
                    deleteButton.id = 'delete-telegram-username';
                    saveButton.replaceWith(deleteButton);

                    deleteButton.addEventListener('click', function() {
                        deleteTelegramNick();
                    });

                    const telegramNickInput = document.getElementById('telegram-nick-input');
                    telegramNickInput.placeholder = '';
                    telegramNickInput.disabled = true;
                    window.open(`https://t.me/mysqlprovkerbot?start`, '_blank');
                } else {
                    alert('Ошибка при сохранении Telegram ника: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Ошибка запроса:', error);
            });
        }

        function deleteTelegramNick() {
            fetch('/myapp/delete-telegram-nick/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Telegram ник удалён');
                    const saveButton = document.createElement('button');
                    saveButton.textContent = 'Сохранить';
                    saveButton.id = 'save-telegram-username';
                    document.querySelector('#delete-telegram-username').replaceWith(saveButton);

                    saveButton.addEventListener('click', function() {
                        const telegramNickInput = document.getElementById('telegram-nick-input');
                        if (telegramNickInput) {
                            const telegramNick = telegramNickInput.value.trim();

                            if (telegramNick !== '' && telegramNick.startsWith('@')) {
                                saveTelegramNick(telegramNick);
                                telegramNickInput.value = '';
                            } else {
                                alert('Введите Telegram ник в формате @nick');
                            }
                        } else {
                            console.error("Element 'telegram-nick-input' not found");
                        }
                    });

                    const telegramNickInput = document.getElementById('telegram-nick-input');
                    telegramNickInput.placeholder = 'Введите Telegram ник';
                    telegramNickInput.disabled = false;
                } else {
                    alert('Ошибка при удалении Telegram ника: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Ошибка запроса:', error);
            });
        }

        function getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    } else {
        console.error("Element 'save-telegram-username' not found");
    }
});
