document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const addButton = document.querySelector('.add-button');
    const taskList = document.getElementById('new-task-list');
    const completedTaskList = document.createElement('ul');
    const completedTasksHeader = document.createElement('h3');
    const dateLabel = document.getElementById('date-label');
    const timeLabel = document.getElementById('time-label');
    const repeatLabel = document.getElementById('repeat-label');
    const searchInput = document.getElementById('search-input');
    const searchStatus = document.getElementById('search-status');
    let completedCount = 0;
    let tasksData = [];
    let currentSortCriteria = null;

    completedTasksHeader.innerHTML = `<span class="arrow">&#9654;</span> Завершенные <span id="completed-count">0</span>`;
    completedTaskList.classList.add('completed-task-list');
    completedTaskList.style.display = 'none';
    completedTasksHeader.style.display = 'none';

    document.querySelector('.task-container').appendChild(completedTasksHeader);
    document.querySelector('.task-container').appendChild(completedTaskList);

    addButton.addEventListener('click', function () {
        const taskText = taskInput.value.trim();
        const dueDateText = dateLabel.textContent.trim();
        const reminderTimeText = timeLabel.textContent.trim();
        const repeatText = repeatLabel.textContent.trim();

        if (taskText !== '') {
            saveTaskToDatabase(taskText, dueDateText, reminderTimeText, repeatText);
            taskInput.value = '';
            dateLabel.textContent = '';
            timeLabel.textContent = '';
            repeatLabel.textContent = '';
            document.getElementById('date-picker').classList.remove('selected');
            document.getElementById('time-picker').classList.remove('selected');
            document.getElementById('repeat-picker').classList.remove('selected');
        } else {
            alert('Текст задачи не может быть пустым');
        }
    });

    completedTasksHeader.addEventListener('click', function () {
        toggleCompletedTasks();
    });

    function addTaskToUI(text, id, dueDateText = '', reminderTimeText = '', repeatText = '', completed = false, starred = false, note = '') {
        if (document.querySelector(`li[data-id='${id}']`)) {
            return; // Если задача уже существует в DOM, не добавляем ее повторно
        }

        const taskItem = document.createElement('li');
        taskItem.classList.add('new-task-item');
        taskItem.dataset.id = id;

        let additionalInfo = '';
        if (dueDateText || reminderTimeText || repeatText) {
            additionalInfo = `
                <div class="additional-info">
                    ${dueDateText ? `<span class="dot-symbol">${dueDateText}</span>` : ''}
                    ${reminderTimeText ? `<span class="dot-symbol">${reminderTimeText}</span>` : ''}
                    ${repeatText ? `<span class="dot-symbol">${repeatText}</span>` : ''}
                </div>
            `;
        }

        taskItem.innerHTML = `
            <input type="checkbox" class="new-task-checkbox" ${completed ? 'checked' : ''}>
            <div class="new-task-content">
                <div class="new-task-number ${completed ? 'completed-text' : ''}">${text}</div>
                ${additionalInfo}
            </div>
            <svg class="star-icon" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="${starred ? '#0078d4' : 'transparent'}"  stroke="#0078d4" stroke-width="2"/>
            </svg>
        `;

        taskItem.querySelector('.star-icon').addEventListener('click', function (event) {
            const path = this.querySelector('path');
            const isStarred = path.getAttribute('fill') === 'transparent';
            updateTaskStar(id, isStarred, taskItem);
            event.stopPropagation();
        });

        taskItem.querySelector('.new-task-checkbox').addEventListener('change', function (event) {
            toggleTaskCompletion(id, this.checked);
            event.stopPropagation();
        });

        taskItem.querySelector('.new-task-checkbox').addEventListener('click', function (event) {
            event.stopPropagation();
        });

        taskItem.addEventListener('click', function () {
            openTaskDetails(id, text, dueDateText, reminderTimeText, repeatText, note);
        });

        if (completed) {
            taskItem.classList.add('completed');
            completedTaskList.appendChild(taskItem);
        } else {
            if (starred) {
                taskList.prepend(taskItem);
            } else {
                taskList.appendChild(taskItem);
            }
        }

        updateCompletedCount();
    }

    function saveTaskToDatabase(text, dueDateText, reminderTimeText, repeatText) {
        const taskData = {
            title: text,
            due_date_text: dueDateText,
            reminder_time_text: reminderTimeText,
            repeat_text: repeatText,
            due_date: '',
            reminder_time: ''
        };

        fetch('/myapp/add-task/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addTaskToUI(data.title, data.id, data.due_date_text, data.reminder_time_text, data.repeat_text);
            } else {
                alert('Ошибка при добавлении задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

    function updateTaskStar(id, star, taskItem) {
        fetch(`/myapp/toggle-star/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ star: star })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const path = taskItem.querySelector('.star-icon path');
                if (star) {
                    path.setAttribute('fill', '#0078d4');
                    taskList.prepend(taskItem);
                } else {
                    path.setAttribute('fill', 'transparent');
                    taskList.appendChild(taskItem);
                }
            } else {
                alert('Ошибка при изменении состояния задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

    function toggleTaskCompletion(taskId, isCompleted) {
        fetch(`/myapp/toggle-task/${taskId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ completed: isCompleted })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const taskElement = document.querySelector(`li[data-id='${taskId}']`);
                taskElement.remove();
                if (isCompleted) {
                    taskElement.classList.add('completed');
                    taskElement.querySelector('.new-task-number').classList.add('completed-text');
                    completedTaskList.appendChild(taskElement);
                } else {
                    taskElement.classList.remove('completed');
                    taskElement.querySelector('.new-task-number').classList.remove('completed-text');
                    taskList.appendChild(taskElement);
                }
                updateCompletedCount();
            } else {
                alert('Ошибка при изменении состояния задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

    function updateCompletedCount() {
        completedCount = completedTaskList.querySelectorAll('.completed').length;
        document.getElementById('completed-count').textContent = completedCount;
        if (completedCount > 0) {
            completedTasksHeader.style.display = 'block';
            completedTaskList.style.display = 'block';
        } else {
            completedTasksHeader.style.display = 'none';
            completedTaskList.style.display = 'none';
        }
        updateArrow();
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

    function toggleCompletedTasks() {
        if (completedTaskList.style.display === 'none') {
            completedTaskList.style.display = 'block';
        } else {
            completedTaskList.style.display = 'none';
        }
        updateArrow();
    }

    function updateArrow() {
        if (completedTaskList.style.display === 'none') {
            document.querySelector('.arrow').textContent = '▶';
        } else {
            document.querySelector('.arrow').textContent = '▼';
        }
    }

    function loadTasks() {
        taskList.innerHTML = ''; // Очищаем список задач
        completedTaskList.innerHTML = ''; // Очищаем список выполненных задач

        fetch('/myapp/get-tasks/')
        .then(response => response.json())
        .then(data => {
            tasksData = data;
            applyCurrentSort();
            data.forEach(task => {
                addTaskToUI(task.title, task.id, task.due_date_text, task.reminder_time_text, task.repeat_text, task.completed, task.star, task.text);
            });
        })
        .catch(error => {
            console.error('Ошибка при загрузке задач:', error);
        });
    }

    function openTaskDetails(id, title, dueDateText, reminderTimeText, repeatText, note) {
        let taskDetails = document.getElementById('task-details');

        if (!taskDetails) {
            taskDetails = document.createElement('div');
            taskDetails.id = 'task-details';
            taskDetails.classList.add('side-menu2');

            taskDetails.innerHTML = `
                <div class="task-header">
                    <h2 id="task-title" contenteditable="true"></h2>
                    <svg class="star-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="transparent" stroke="#0078d4" stroke-width="2"/>
                    </svg>
                </div>
                <div id="task-reminder" class="task-detail">Напоминание</div>
                <div id="task-due-date" class="task-detail">Дата выполнения</div>
                <div id="task-repeat" class="task-detail">Повтор</div>
                <div class="task-detail-divider"></div>
                <div id="task-note" class="task-detail" contenteditable="true">Добавить заметку</div>
                <div class="task-detail-divider"></div>
                <div class="task-details-footer">
                    <div id="task-created" class="created-info" style="padding-bottom: 30px">Создано: пн, 3 июня</div>
                </div>
            `;
            document.body.appendChild(taskDetails);

            document.getElementById('task-title').addEventListener('blur', function () {
                updateTaskTitle(id, this.textContent);
            });

            document.getElementById('task-note').addEventListener('blur', function () {
                updateTaskNote(id, this.textContent);
            });

            document.getElementById('task-created').innerHTML = `
                <div class="created-info">
                    <i class="fa fa-trash" onclick="deleteTask(${id})"></i>
                    <span>Создано: ${new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <i class="fa fa-edit" onclick="closeTaskDetails()"></i>
                </div>
            `;
        }

        document.getElementById('task-title').textContent = title || '123';
        document.getElementById('task-reminder').textContent = reminderTimeText || 'Напоминание';
        document.getElementById('task-due-date').textContent = dueDateText || 'Дата выполнения';
        document.getElementById('task-repeat').textContent = repeatText || 'Повтор';
        document.getElementById('task-note').textContent = note || 'Добавить заметку';

        taskDetails.style.display = 'block';

    }

    function closeTaskDetails() {
        const taskDetails = document.getElementById('task-details');
        if (taskDetails) {
            taskDetails.style.display = 'none';
        }
    }

    function updateTaskTitle(id, title) {
        fetch(`/myapp/update-task/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ title: title })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const taskElement = document.querySelector(`li[data-id='${id}'] .new-task-number`);
                if (taskElement) {
                    taskElement.textContent = title;
                }
            } else {
                alert('Ошибка при обновлении задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

    function updateTaskNote(id, note) {
        fetch(`/myapp/update-task/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ text: note })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Ошибка при обновлении заметки: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

    loadTasks();

    const style = document.createElement('style');
    style.textContent = `
        .completed-task-list {
            list-style: none;
            padding: 0;
            margin: 10px 0 0 0;
        }

        .completed-task-list .new-task-item {
            margin-bottom: 5px;
        }

        .arrow {
            cursor: pointer;
            user-select: none;
            margin-right: 5px;
        }

        .completed-task-header:hover {
            cursor: pointer;
        }

        .new-task-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: #2c2c2c;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            margin-bottom: 10px;
        }

        .new-task-item:hover {
            cursor: pointer;
        }

        .new-task-checkbox {
            margin-right: 10px;
        }

        .new-task-number {
            flex: 1;
            color: #fff;
        }

        .star-icon {
            cursor: pointer;
            margin-left: auto;
        }

        .additional-info {
            font-size: 12px;
            color: #a0a0a0;
            margin-top: 5px;
        }
        
        .new-task-content {
            display: flex;
            flex-direction: column;
        }

        .completed-text {
            text-decoration: line-through;
        }

        .dot-symbol::before {
            content: '•';
            margin: 0 5px;
        }

        .task-detail {
            padding: 10px 0;
            cursor: pointer;
        }

        .task-detail-divider {
            border-top: 1px solid #555555;
            margin: 10px 0;
        }

        .fa-trash, .fa-edit{
            cursor: pointer;
            margin: 0 10px;
            font-size: 14px; /* Уменьшаем размер шрифта */
        }

        .side-menu2 {
            display: none;
            position: fixed;
            right: 0;
            top: 0;
            width: 100%;
            max-width: 300px;
            height: 100%;
            background-color: #262829;
            color: #ffffff;
            box-shadow: -2px 0 5px rgba(0,0,0,0.5);
            z-index: 1000;
            padding: 20px;
        }

        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #555555;
            padding-bottom: 10px;
        }

        .task-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px солидный #0078d4;
            display: inline-block;
        }

        .task-title {
            flex-grow: 1;
            margin-left: 10px;
            padding-top: 10px;
        }

        .task-body {
            padding: 20px 0;
            border-bottom: 1px solid #555555;
        }

        .task-footer {
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
        }

        .separator {
            margin: 0 10px;
        }

        .created-date {
            margin-top: 20px;
            text-align: center;
        }

        .created-info {
            font-weight: bold;
        }
        
        .divider {
            border-bottom: 1px solid #555555;
            margin: 10px 0;
        }

        .task-detail-section span {
            display: block;
            margin: 10px 0;
        }

        .task-detail-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
        }

        .footer-icons i {
            cursor: pointer;
            margin-left: 10px;
        }

        .task-details-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 10px 0;
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        font-size: 12px; /* Уменьшаем размер шрифта */
        }

        .new-task-item .task-circle,
        .new-task-item .star-icon {
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    updateArrow();

    document.querySelector('.clear-icon').addEventListener('click', function () {
        searchInput.value = '';
        searchStatus.innerHTML = 'Задачи <i class="fa fa-ellipsis-v" id="params-icon" style="margin-left: 10px; cursor: pointer;"></i>';
        const tasks = document.querySelectorAll('.new-task-item');
        tasks.forEach(task => {
            task.style.display = 'flex';
        });
    });

    const sortButton = document.querySelector('.sort-button');
    const sortStatusContainer = document.createElement('div');
    sortStatusContainer.classList.add('sort-status-container');
    const navRight = document.querySelector('.nav-right');
    navRight.insertAdjacentElement('beforebegin', sortStatusContainer);

    const sortMenu = document.createElement('div');
    sortMenu.id = 'sort-menu';
    sortMenu.classList.add('sort-menu', 'hidden');
    sortMenu.innerHTML = `
        <h2 class="sort-header">Порядок сортировки</h2>
        <div class="menu-divider2"></div>
        <div class="sort-item" id="sort-date">По дате выполнения</div>
        <div class="menu-divider2"></div>
        <div class="sort-item" id="sort-alpha">По алфавиту</div>
        <div class="menu-divider2"></div>
        <div class="sort-item" id="sort-creation">По дате создания</div>
    `;
    document.body.appendChild(sortMenu);

    sortButton.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        sortMenu.classList.toggle('hidden');
        const sortButtonRect = sortButton.getBoundingClientRect();
        const sortMenuRect = sortMenu.getBoundingClientRect();
        sortMenu.style.top = sortButtonRect.bottom + 'px';
        sortMenu.style.left = (sortButtonRect.left - (sortMenuRect.width - sortButtonRect.width) / 2) + 'px';
    });

    document.addEventListener('click', function(event) {
        if (!sortMenu.contains(event.target) && event.target !== sortButton) {
            sortMenu.classList.add('hidden');
        }
    });

    document.getElementById('sort-date').addEventListener('click', function() {
        sortTasks('date');
    });

    document.getElementById('sort-alpha').addEventListener('click', function() {
        sortTasks('alpha');
    });

    document.getElementById('sort-creation').addEventListener('click', function() {
        sortTasks('creation');
    });

    function sortTasks(criteria) {
        let sortedTasks;
        const pinnedTasks = tasksData.filter(task => task.star);
        const unpinnedTasks = tasksData.filter(task => !task.star);

        if (criteria === 'date') {
            sortedTasks = unpinnedTasks.sort((a, b) => {
                if (!a.due_date_text && !b.due_date_text) return 0;
                if (!a.due_date_text) return 1;
                if (!b.due_date_text) return -1;
                return new Date(a.due_date_text) - new Date(b.due_date_text);
            });
        } else if (criteria === 'alpha') {
            sortedTasks = unpinnedTasks.sort((a, b) => a.title.localeCompare(b.title));
        } else if (criteria === 'creation') {
            sortedTasks = unpinnedTasks.sort((a, b) => a.id - b.id); // Assuming 'id' is auto-incremented and reflects creation order
        }

        taskList.innerHTML = '';
        pinnedTasks.forEach(task => {
            addTaskToUI(task.title, task.id, task.due_date_text, task.reminder_time_text, task.repeat_text, task.completed, task.star, task.text);
        });
        sortedTasks.forEach(task => {
            addTaskToUI(task.title, task.id, task.due_date_text, task.reminder_time_text, task.repeat_text, task.completed, task.star, task.text);
        });

        sortMenu.classList.add('hidden');
        saveCurrentSort(criteria);
        displaySortStatus(criteria);
    }

    function displaySortStatus(criteria) {
        let sortStatus = document.querySelector('.sort-status');
        if (!sortStatus) {
            sortStatus = document.createElement('div');
            sortStatus.classList.add('sort-status');
            sortStatusContainer.appendChild(sortStatus);
        }

        const criteriaText = criteria === 'date' ? 'по дате выполнения' : criteria === 'alpha' ? 'по алфавиту' : 'по дате создания';
        sortStatus.innerHTML = `Сортировка ${criteriaText} <span class="clear-sort" style="cursor: pointer;">&times;</span>`;
    }

    const styleSort = document.createElement('style');
    styleSort.innerHTML = `
        .sort-menu {
            position: absolute;
            background-color: #262829;
            border: 1px solid #555;
            border-radius: 5px;
            padding: 10px;
            z-index: 1000;
        }
    
        .sort-menu.hidden {
            display: none;
        }
    
        .sort-header {
            font-size: 16px;
            margin: 0;
            padding: 10px 0;
        }
    
        .menu-divider2 {
            height: 1px;
            background-color: #444;
            width: 110%;
            margin-left: -6%;
        }
    
        .sort-menu .sort-item {
            padding: 10px 0;
            cursor: pointer;
            font-size: 14px;
        }
    
        .sort-menu .sort-item:hover {
            background-color: #333;
        }
    
        .sort-status-container {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            color: #ffffff;
        }
    
        .sort-status {
            font-size: 16px;
            display: inline-block;
            margin-right: 10px;
            position: relative;
        }
    
        .sort-status .clear-sort {
            cursor: pointer;
            margin-left: 5px;
            position: absolute;
            right: -15px;
            font-size: 18px;
        }
    `;
    document.head.appendChild(styleSort);


    function searchTasks() {
        const query = searchInput.value.toLowerCase();
        console.log('Search query:', query);  // Логирование запроса поиска
        const tasks = document.querySelectorAll('.new-task-item');
        let found = false;
    
        tasks.forEach(task => {
            const taskText = task.querySelector('.new-task-number').textContent.toLowerCase();
            console.log('Task text:', taskText);  // Логирование текста задачи
            if (taskText.includes(query)) {
                task.style.setProperty('display', 'flex', 'important');
                found = true;
                console.log('Task found:', taskText);  // Логирование найденной задачи
            } else {
                task.style.setProperty('display', 'none', 'important');
                console.log('Task hidden:', taskText);  // Логирование скрытой задачи
            }
        });
    
        if (query && !found) {
            searchStatus.innerHTML = `Задачи <i class="fa fa-ellipsis-v" id="params-icon" style="margin-left: 10px; cursor: pointer;"></i> <span class="search-query" style="margin-left: 10px;">Поиск по "${query}"</span>`;
            console.log('No tasks found for query:', query);  // Логирование случая, когда задачи не найдены
        } else {
            searchStatus.innerHTML = 'Задачи <i class="fa fa-ellipsis-v" id="params-icon" style="margin-left: 10px; cursor: pointer;"></i>';
            console.log('Tasks found for query:', query);  // Логирование случая, когда задачи найдены
        }
    }
    
    searchInput.addEventListener('input', searchTasks);
    
    

    function saveCurrentSort(criteria) {
        localStorage.setItem('currentSort', criteria);
    }

    function loadCurrentSort() {
        return localStorage.getItem('currentSort');
    }

    function applyCurrentSort() {
        const currentSort = loadCurrentSort();
        if (currentSort) {
            sortTasks(currentSort);
            displaySortStatus(currentSort);
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('clear-sort')) {
            localStorage.removeItem('currentSort');
            sortStatusContainer.innerHTML = '';
            loadTasks(); // Перезагрузка задач без сортировки
        }
    });

    applyCurrentSort();
    
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('fa-trash')) {
            const taskId = document.querySelector('.new-task-item').dataset.id;
            deleteTask(taskId);
        }
    });

    function deleteTask(taskId) {
        fetch(`/myapp/delete-task/${taskId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const taskElement = document.querySelector(`li[data-id='${taskId}']`);
                if (taskElement) {
                    taskElement.remove();
                }
                closeTaskDetails();
                updateCompletedCount();
            } else {
                alert('Ошибка при удалении задачи: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
    }

});
