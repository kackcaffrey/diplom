document.addEventListener("DOMContentLoaded", function() {
    const reminderPicker = document.querySelector('.reminder-picker');
    const customTimeInput = document.getElementById('custom-time');
    const reminderIcon = document.querySelector('.fa-bell');
    const timeLabel = document.getElementById('time-label');
    const reminderContainer = document.querySelector('.reminder-container');
    const deleteButton = document.getElementById('delete-time-btn');
    const calendarContainer = document.getElementById('custom-calendar2');
    const customDateInput = document.getElementById('custom-date');
    const dateIcon = document.querySelector('.fa-calendar');
    const repeatIcon = document.querySelector('.fa-repeat');

    const datePicker = document.querySelector('.date-picker');
    const repeatPicker = document.querySelector('.repeat-picker');

    let openMenu = null;

    function closeOpenMenu() {
        if (openMenu && openMenu.style.display === 'block') {
            openMenu.style.display = 'none';
        }
    }

    const monthsGenitive = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    if (!reminderPicker || !customTimeInput || !reminderIcon || !timeLabel || !reminderContainer || !deleteButton || !calendarContainer || !customDateInput) {
        console.error("Один или несколько необходимых элементов отсутствуют.");
        return;
    }

    updateReminderOptions();

    reminderIcon.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeOpenMenu();
        toggleReminderPicker();
    });

    timeLabel.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeOpenMenu();
        toggleReminderPicker();
    });

    reminderContainer.addEventListener('click', function(event) {
        event.stopPropagation();
        if (!event.target.classList.contains('fa-bell') && !event.target.classList.contains('time-label')) {
            toggleReminderPicker();
        }
    });

    document.addEventListener('click', function(event) {
        if (!reminderPicker.contains(event.target) && !reminderIcon.contains(event.target) && !timeLabel.contains(event.target) && !deleteButton.contains(event.target)) {
            reminderPicker.style.display = 'none';
        }
    });

    dateIcon.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeOpenMenu();
        toggleDatePicker();
    });

    repeatIcon.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeOpenMenu();
        toggleRepeatPicker();
    });

    function toggleReminderPicker() {
        console.log("Toggle Reminder Picker");
        if (reminderPicker.style.display === 'block') {
            reminderPicker.style.display = 'none';
        } else {
            reminderPicker.style.display = 'block';
        }
        openMenu = reminderPicker;
    }

    function toggleDatePicker() {
        console.log("Toggle Date Picker");
        if (datePicker.style.display === 'block') {
            datePicker.style.display = 'none';
        } else {
            datePicker.style.display = 'block';
        }
        openMenu = datePicker;
    }

    function toggleRepeatPicker() {
        console.log("Toggle Repeat Picker");
        if (repeatPicker.style.display === 'block') {
            repeatPicker.style.display = 'none';
        } else {
            repeatPicker.style.display = 'block';
        }
        openMenu = repeatPicker;
    }

    function showCalendar() {
        console.log('Показываем календарь', calendarContainer);
        calendarContainer.style.display = 'block';
        reminderPicker.style.display = 'none';
    }

    document.querySelectorAll('.time-option').forEach(item => {
        console.log('Проверка элемента времени: ', item, ' с атрибутом data-time-type: ', item.dataset.timeType);
        if (!item.dataset.timeType) {
            console.error("Отсутствует атрибут data-time-type у элемента: ", item);
        }
        item.addEventListener('click', function(event) {
            event.stopPropagation();
            console.log("Time option clicked: ", this.dataset.timeType);
            selectTime(this.dataset.timeType);
            reminderPicker.style.display = 'none';
        });
    });

    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation();
        event.preventDefault();
        console.log("Delete button clicked");
        customTimeInput.value = '';
        customDateInput.value = '';
        updateTimeLabel('');
        reminderContainer.classList.remove('selected');
      
        reminderPicker.style.display = 'block';
        // Explicitly remove margin
        reminderContainer.style.marginLeft = '0';
        reminderContainer.style.marginRight = '0';
    });

    document.getElementById('choose-time-btn').addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Choose time button clicked");
        showCalendar();
        this.blur();
    });

    customTimeInput.addEventListener('change', function(event) {
        event.stopPropagation();
        const selectedTime = this.value;
        console.log("Custom time input changed: ", selectedTime);
        updateTimeLabel(selectedTime);
        calendarContainer.style.display = 'none';
        reminderPicker.style.display = 'none';
        addMarginIfLabelNotEmpty();
       
    });

    function selectTime(timeType) {
        console.log("selectTime вызван с timeType:", timeType);
        let time = new Date();
        let label;
        switch(timeType) {
            case 'laterToday':
                time.setHours(time.getHours() + 4);
                time.setMinutes(0);
                label = `${String(time.getHours()).padStart(2, '0')}:00, сегодня`;
                break;
            case 'tomorrow':
                time.setDate(time.getDate() + 1);
                time.setHours(9, 0);
                label = `9:00, завтра`;
                break;
            case 'nextWeek':
                time = getNextMonday();
                time.setHours(9, 0);
                label = `9:00, ${formatDateLabel(time)}`;
                break;
            default:
                console.error("Unknown time type: ", timeType);
                return;
        }
        customTimeInput.value = time.toTimeString().slice(0, 5);
        updateTimeLabel(label);
        reminderContainer.classList.add('selected');
        reminderPicker.style.display = 'none';  // Закрываем окно выбора напоминания после выбора времени
    }

    function getNextMonday() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        today.setDate(today.getDate() + diff);
        return today;
    }

    function formatDateLabel(date) {
        return `${date.toLocaleDateString('ru-RU', { weekday: 'short' })}, ${date.getDate()} ${monthsGenitive[date.getMonth()]}`;
    }

    function updateTimeLabel(text) {
        console.log("updateTimeLabel вызван с текстом:", text);
        timeLabel.textContent = text;
        if (text) {
            timeLabel.style.visibility = 'visible';
            timeLabel.classList.add('visible');
            deleteButton.style.display = 'block';
            reminderContainer.classList.add('selected');
        } else {
            timeLabel.style.visibility = 'hidden';
            timeLabel.classList.remove('visible');
            deleteButton.style.display = 'none';
            reminderContainer.classList.remove('selected');
            // Explicitly remove margin
            reminderContainer.style.marginLeft = '0';
            reminderContainer.style.marginRight = '0';
        }
    }

   

    function updateReminderOptions() {
        const now = new Date();
        const laterToday = new Date(now);
        laterToday.setHours(now.getHours() + 4);
        laterToday.setMinutes(0);
        document.querySelector('.time-option[data-time-type="laterToday"] span').textContent = `${String(laterToday.getHours()).padStart(2, '0')}:00`;

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(9, 0);
        document.querySelector('.time-option[data-time-type="tomorrow"] span').textContent = `9:00, ${tomorrow.toLocaleDateString('ru-RU', { weekday: 'short' })}`;

        const nextMonday = getNextMonday();
        nextMonday.setHours(9, 0);
        document.querySelector('.time-option[data-time-type="nextWeek"] span').textContent = `9:00, ${nextMonday.toLocaleDateString('ru-RU', { weekday: 'short' })}`;
    }
});
