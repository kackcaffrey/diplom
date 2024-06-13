document.addEventListener("DOMContentLoaded", function() {
    const customRepeatInput = document.getElementById('repeat-op');
    const repeatContainer = document.querySelector('.repeat-container');
    const daysOfWeek = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
    let selectedDays = new Set();
    let repeatFrequency = 1;
    let repeatUnit = 'дн.';
    let repeatSaved = false; // New variable to track if settings were saved

    document.getElementById('choose-repeat-btn').addEventListener('click', function() {
        if (!document.querySelector('.repeat-settings')) {
            showRepeatSettings();
        }
    });

    function showRepeatSettings() {
        const repeatSettings = document.createElement('div');
        repeatSettings.className = 'repeat-settings';
        repeatSettings.style.position = 'absolute';
        repeatSettings.style.backgroundColor = '#262829';
        repeatSettings.style.color = '#fff';
        repeatSettings.style.padding = '10px';
        repeatSettings.style.borderRadius = '5px';
        repeatSettings.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        repeatSettings.style.zIndex = '1000';

        const rect = repeatContainer.getBoundingClientRect();
        repeatSettings.style.top = `${rect.bottom + window.scrollY}px`;
        repeatSettings.style.left = `${rect.left + window.scrollX}px`;

        repeatSettings.innerHTML = `
            <div>
                <input type="number" id="repeat-frequency" value="${repeatFrequency}" min="1" style="width: 50px; margin-right: 10px; background-color: #262829; color: white; border: 1px solid #555;" />
                <select id="repeat-unit" style="background-color: #262829; color: white; border: 1px solid #555;">
                    <option value="дн.">дн.</option>
                    <option value="нед.">нед.</option>
                    <option value="мес.">мес.</option>
                    <option value="г.">г.</option>
                </select>
            </div>
            <div id="repeat-days" class="repeat-days" style="display: flex; justify-content: space-between; margin-top: 10px; border: 1px solid #555; padding: 5px;">
                ${daysOfWeek.map(day => `<span class="repeat-day" data-day="${day}" style="padding: 5px; cursor: pointer; color: grey;">${day}</span>`).join('')}
            </div>
            <button id="save-repeat-btn" class="save-button" style="background-color: #262829; color: grey; padding: 5px 10px; margin-top: 10px;" disabled>Сохранить</button>
        `;

        document.body.appendChild(repeatSettings);

        document.getElementById('repeat-unit').addEventListener('change', function() {
            repeatUnit = this.value;
            updateDaysVisibility();
            updateSaveButtonState();
        });

        document.getElementById('repeat-frequency').addEventListener('change', function() {
            repeatFrequency = parseInt(this.value);
            updateSaveButtonState();
        });

        document.querySelectorAll('.repeat-day').forEach(day => {
            day.addEventListener('click', function() {
                if (selectedDays.has(this.dataset.day)) {
                    selectedDays.delete(this.dataset.day);
                    this.style.color = 'grey';
                } else {
                    selectedDays.add(this.dataset.day);
                    this.style.color = 'white';
                }
                updateSaveButtonState();
            });
        });

        document.getElementById('save-repeat-btn').addEventListener('click', function() {
            saveRepeatSettings();
            document.body.removeChild(repeatSettings);
        });

        updateDaysVisibility();
        updateSaveButtonState();
    }

    document.addEventListener('mousedown', function(event) {
        const repeatSettings = document.querySelector('.repeat-settings');
        if (repeatSettings && !repeatSettings.contains(event.target) && !repeatContainer.contains(event.target)) {
            document.body.removeChild(repeatSettings);
            if (!repeatSaved) {
                resetRepeatSettings(); // Reset settings if not saved
                updateRepeatLabel(""); // Clear the label if not saved
            }
        }
    });

    function updateDaysVisibility() {
        const repeatDaysContainer = document.getElementById('repeat-days');
        if (repeatUnit === 'нед.') {
            repeatDaysContainer.style.display = 'flex';
        } else {
            repeatDaysContainer.style.display = 'none';
            selectedDays.clear();
            document.querySelectorAll('.repeat-day').forEach(day => {
                day.style.color = 'grey';
            });
        }
    }

    function updateSaveButtonState() {
        const saveButton = document.getElementById('save-repeat-btn');
        if (repeatUnit === 'нед.' && selectedDays.size === 0) {
            saveButton.disabled = true;
            saveButton.style.color = 'grey';
        } else {
            saveButton.disabled = false;
            saveButton.style.color = 'white';
        }
    }

    function saveRepeatSettings() {
        let repeatDescription = "";
        if (repeatFrequency === 1 && repeatUnit === "дн.") {
            repeatDescription = "Ежедневно";
        } else if (repeatFrequency === 1 && repeatUnit === "мес.") {
            repeatDescription = "Ежемесячно";
        } else if (repeatFrequency === 1 && repeatUnit === "г.") {
            repeatDescription = "Ежегодно";
        } else {
            repeatDescription = `Раз в ${repeatFrequency} ${repeatUnit}`;
            if (repeatUnit === 'нед.' && selectedDays.size > 0) {
                repeatDescription = `Еженедельно, ${Array.from(selectedDays).join(', ')}`;
            }
        }

        customRepeatInput.value = repeatDescription;
        updateRepeatLabel(repeatDescription);
        resetRepeatSettings();
        repeatSaved = true; // Mark settings as saved
        toggleDeleteButtonVisibility(); // Show delete button only after saving
    }

    function updateRepeatLabel(text) {
        const repeatLabel = document.getElementById('repeat-label');
        repeatLabel.textContent = text;
        if (text) {
            repeatLabel.style.visibility = 'visible';
            repeatContainer.classList.add('selected');
        } else {
            repeatLabel.style.visibility = 'hidden';
            repeatContainer.classList.remove('selected');
        }
    }

    function resetRepeatSettings() {
        repeatFrequency = 1;
        repeatUnit = 'дн.';
        selectedDays.clear();
        repeatSaved = false; // Reset the saved state
    }

    function toggleDeleteButtonVisibility() {
        const deleteButton = document.getElementById('delete-repeat-btn');
        if (repeatSaved) {
            deleteButton.style.display = 'block';
        } else {
            deleteButton.style.display = 'none';
        }
    }
});
