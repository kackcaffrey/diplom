document.addEventListener("DOMContentLoaded", function() {
    const datePicker = document.querySelector('.date-picker');
    const customDateInput = document.getElementById('custom-date');
    const customTimeInput = document.getElementById('custom-time');
    const calendarIcon = document.querySelector('.fa-calendar');
    const dateLabel = document.getElementById('date-label');
    const deleteButton = document.getElementById('delete-date-btn');
    const calendarContainer = document.getElementById('custom-calendar');
    const taskDateContainer = document.querySelector('.task-date-container');
    const taskDateBlock = document.querySelector('.icon-with-label.task-date-container');
    const reminderContainer = document.querySelector('.reminder-container');

    let openMenu = null;

    function closeOpenMenu() {
        if (openMenu && openMenu.classList.contains('visible')) {
            openMenu.classList.remove('visible');
            openMenu.classList.add('hidden');
        }
    }

    updateDateOptions();

    calendarIcon.addEventListener('click', function(event) {
        event.stopPropagation();  // Предотвратить всплытие события
        console.log('Нажата иконка календаря');
        closeOpenMenu();
        toggleDatePicker();
    });

    taskDateBlock.addEventListener('click', function(event) {
        event.stopPropagation();  // Предотвратить всплытие события
        console.log('Нажат блок даты задачи');
        closeOpenMenu();
        toggleDatePicker();
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.date-picker') && !event.target.closest('.fa-calendar') && !event.target.closest('#delete-date-btn')) {
            datePicker.classList.add('hidden');
            datePicker.classList.remove('visible');
        }
    });

    function toggleDatePicker() {
        datePicker.classList.toggle('visible');
        datePicker.classList.toggle('hidden');
        openMenu = datePicker;
        console.log('Переключить Date Picker');
    }

    function showCalendar() {
        calendarContainer.style.display = 'block';
        datePicker.style.display = 'none';
    }

    document.querySelectorAll('.date-option').forEach(item => {
        if (!item.dataset.dateType) {
            console.error('Отсутствует атрибут data-date-type:', item);
        }
        item.addEventListener('click', function() {
            if (this.dataset.dateType) {
                selectDate(this.dataset.dateType);
                this.classList.add('selected-date');
                closeDatePicker();
            } else {
                console.error('Отсутствует атрибут data-date-type:', this);
            }
        });
    });

    function closeDatePicker() {
        datePicker.classList.remove('visible');
        datePicker.classList.add('hidden');
    }

    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation();  // Предотвратить всплытие события
        console.log('Нажата кнопка удаления');
        customDateInput.value = '';
        updateDateLabel('');
        toggleDeleteButtonVisibility();
        taskDateContainer.classList.remove('selected');
        removeSelectedDate();
        
    });

    document.getElementById('choose-date-btn').addEventListener('click', function() {
        showCalendar();
    });

    customDateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        let labelText = formatDateLabel(selectedDate) + ", " + selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        if (selectedDate.getFullYear() !== 2024) {
            labelText += ", " + selectedDate.getFullYear();
        }
        updateDateLabel(labelText);
        taskDateContainer.classList.add('selected');
        toggleDeleteButtonVisibility();
        calendarContainer.style.display = 'none';
        
    });

    function selectDate(dateType) {
        let date;
        let label;
        switch(dateType) {
            case 'today':
                date = new Date();
                label = "Сегодня";
                break;
            case 'tomorrow':
                date = new Date();
                date.setDate(date.getDate() + 1);
                label = "Завтра";
                break;
            case 'nextWeek':
                date = getNextMonday();
                label = formatDateLabel(date) + ", " + date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
                if (date.getFullYear() !== 2024) {
                    label += ", " + date.getFullYear();
                }
                break;
            default:
                console.error('Недействительный тип даты:', dateType);
                return; // Выйти из функции, если тип даты недействителен
        }

        if (date) {
            customDateInput.value = date.toISOString().split('T')[0];
            updateDateLabel(label);
            toggleDeleteButtonVisibility();
            taskDateContainer.classList.add('selected');
            closeDatePicker();
           
        } else {
            console.error('Дата не определена для типа даты:', dateType);
        }
    }

    function getNextMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        today.setDate(today.getDate() + diff);
        return today;
    }

    function formatDateLabel(date) {
        return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    }

    function updateDateLabel(text) {
        dateLabel.textContent = text;
        if (text) {
            dateLabel.style.visibility = 'visible';
            deleteButton.style.display = 'block';
        } else {
            dateLabel.style.visibility = 'hidden';
            deleteButton.style.display = 'none';
        }
    }

    function toggleDeleteButtonVisibility() {
        if (customDateInput.value) {
            deleteButton.style.display = 'block';
        } else {
            deleteButton.style.display = 'none';
        }
    }

    function removeSelectedDate() {
        document.querySelectorAll('.date-option').forEach(option => option.classList.remove('selected-date'));
    }

    function updateDateOptions() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonday = getNextMonday(today);

        document.querySelector('.date-option[data-date-type="today"] span').textContent = formatDateLabel(today);
        document.querySelector('.date-option[data-date-type="tomorrow"] span').textContent = formatDateLabel(tomorrow);
        document.querySelector('.date-option[data-date-type="nextWeek"] span').textContent = formatDateLabel(nextMonday);
    }
});
