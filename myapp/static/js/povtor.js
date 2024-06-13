document.addEventListener("DOMContentLoaded", function() {
    const repeatIcon = document.getElementById('repeat-icon');
    const repeatContainer = document.querySelector('.repeat-container');
    const repeatPicker = document.querySelector('.repeat-picker');
    const chooseRepeatBtn = document.getElementById('choose-repeat-btn');
    const customRepeatInput = document.getElementById('repeat-op');
    const calendarContainer = document.getElementById('custom-calendar3');
    const deleteButton = document.getElementById('delete-repeat-btn');
    const repeatLabel = document.getElementById('repeat-label');
    const reminderContainer = document.querySelector('.reminder-container'); // Контейнер напоминаний слева

    let openMenu = null;

    function closeOpenMenu() {
        if (openMenu && openMenu.style.display === 'block') {
            openMenu.style.display = 'none';
        }
    }

    repeatContainer.addEventListener('click', function(event) {
        event.stopPropagation();
        closeOpenMenu();
        toggleRepeatPicker();
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.repeat-picker') && !event.target.closest('.repeat-container')) {
            repeatPicker.style.display = 'none';
        }
    });

    document.querySelectorAll('.repeat-option').forEach(item => {
        item.addEventListener('click', function(event) {
            if (this !== deleteButton) {
                selectRepeatOption(this.dataset.repeatType);
                document.querySelectorAll('.repeat-option').forEach(option => option.classList.remove('selected-repeat'));
                this.classList.add('selected-repeat');
                repeatPicker.style.display = 'none';
            }
        });
    });

    chooseRepeatBtn.addEventListener('click', function() {
        showCalendar();
    });

    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Останавливаем всплытие события
        customRepeatInput.value = '';
        updateRepeatLabel('');
        toggleDeleteButtonVisibility();
        document.querySelectorAll('.repeat-option').forEach(option => option.classList.remove('selected-repeat'));
        removeMarginBetweenContainers();
    });

    function toggleRepeatPicker() {
        repeatPicker.style.left = '5px';
        repeatPicker.style.display = repeatPicker.style.display === 'block' ? 'none' : 'block';
        openMenu = repeatPicker;
    }

    function showCalendar() {
        calendarContainer.style.display = 'block';
        repeatPicker.style.display = 'none';
    }

    function selectRepeatOption(repeatType) {
        let repeat;
        switch(repeatType) {
            case 'daily':
                repeat = "Ежедневно";
                break;
            case 'weekly':
                repeat = "Еженедельно";
                break;
            case 'monthly':
                repeat = "Ежемесячно";
                break;
            case 'yearly':
                repeat = "Ежегодно";
                break;
            case 'custom': // Assuming 'custom' for "Настроить повтор"
                repeat = "Настроить повтор";
                break;
        }
        customRepeatInput.value = repeat;
        updateRepeatLabel(repeat);
        
        if (repeatType !== 'custom') {
            toggleDeleteButtonVisibility();
        }
    }

    function updateRepeatLabel(text) {
        repeatLabel.textContent = text;
        if (text && text !== "Настроить повтор") { // Ensure "Настроить повтор" does not display the delete button
            repeatLabel.style.visibility = 'visible';
            deleteButton.style.display = 'block';
        } else {
            repeatLabel.style.visibility = 'hidden';
            deleteButton.style.display = 'none';
        }
    }

    function toggleDeleteButtonVisibility() {
        if (customRepeatInput.value && customRepeatInput.value !== "Настроить повтор") {
            deleteButton.style.display = 'block';
        } else {
            deleteButton.style.display = 'none';
        }
    }

    function removeMarginBetweenContainers() {
        repeatContainer.style.marginLeft = '0';
    }
});
