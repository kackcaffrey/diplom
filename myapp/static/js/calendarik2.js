function updateDateLabel2(text) {
    const timeLabel2 = document.getElementById('time-label');
    const reminderContainer = document.querySelector('.reminder-container');
    timeLabel2.textContent = text;
    if (text) {
        timeLabel2.style.visibility = 'visible';
        reminderContainer.style.marginLeft = '10px'; // Добавление отступа слева
    } else {
        timeLabel2.style.visibility = 'hidden';
        reminderContainer.style.marginLeft = '0'; // Удаление отступа
    }
    console.log("Метка даты обновлена: " + text);
}

function formatDateLabel2(date) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
}

function CalendarControl2() {
    const calendar2 = new Date();
    const customDateInput2 = document.getElementById('custom-date');
    const calendarContainer2 = document.getElementById('custom-calendar2');
    const timeLabel2 = document.getElementById('time-label');
    const reminderContainer = document.querySelector('.reminder-container');
    const today = new Date();

    const timeInput2 = document.createElement('input');
    timeInput2.type = 'time';
    timeInput2.id = 'time-input';
    timeInput2.className = 'time-input';
    timeInput2.style.width = '70%';

    const saveButton2 = document.createElement('button');
    saveButton2.textContent = 'Сохранить';
    saveButton2.id = 'save-time-btn';
    saveButton2.className = 'save-button';
    saveButton2.style.backgroundColor = '#262829';
    saveButton2.style.display = 'block';
    saveButton2.style.marginTop = '10px';

    const calendarControl2 = {
        localDate2: today,
        calWeekDays2: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        calMonthName2: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
        calMonthName2Genitive: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        daysInMonth2: function (month, year) {
            return new Date(year, month + 1, 0).getDate();
        },
        firstDay2: function () {
            return new Date(calendar2.getFullYear(), calendar2.getMonth(), 1);
        },
        lastDay2: function () {
            return new Date(calendar2.getFullYear(), calendar2.getMonth() + 1, 0);
        },
        firstDayNumber2: function () {
            return this.firstDay2().getDay();
        },
        getPreviousMonthLastDate2: function () {
            return new Date(calendar2.getFullYear(), calendar2.getMonth(), 0).getDate();
        },
        navigateToPreviousMonth2: function () {
            calendar2.setMonth(calendar2.getMonth() - 1);
            this.displayMonth2();
            this.displayYear2();
            this.plotDates2();
        },
        navigateToNextMonth2: function () {
            calendar2.setMonth(calendar2.getMonth() + 1);
            this.displayMonth2();
            this.displayYear2();
            this.plotDates2();
        },
        navigateToCurrentMonth2: function () {
            calendar2.setMonth(this.localDate2.getMonth());
            calendar2.setFullYear(this.localDate2.getFullYear());
            this.displayMonth2();
            this.displayYear2();
            this.plotDates2();
        },
        displayYear2: function () {
            let yearLabel2 = calendarContainer2.querySelector(".calendar-year-label");
            yearLabel2.innerHTML = calendar2.getFullYear();
        },
        displayMonth2: function () {
            let monthLabel2 = calendarContainer2.querySelector(".calendar-month-label");
            monthLabel2.innerHTML = this.calMonthName2[calendar2.getMonth()];
        },
        updateTimeLabel2: function (date, time) {
            const daysOfWeek = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
            const formattedDate = `${daysOfWeek[date.getDay()]}, ${date.getDate()} ${this.calMonthName2Genitive[date.getMonth()]}`;
            timeLabel2.textContent = `${formattedDate}, ${time}`;
            timeLabel2.style.visibility = 'visible'; // Ensure it's visible
            console.log('Updated time label:', timeLabel2.textContent);
        },
        
        selectDate2: function (e) {
            e.preventDefault();
            const targetDateElement = e.target.closest('.date-item');
        
            if (!targetDateElement || targetDateElement.classList.contains('disabled')) return;
        
            const selectedDateElement = calendarContainer2.querySelector('.date-item.selected');
            if (selectedDateElement) {
                selectedDateElement.classList.remove('selected');
                selectedDateElement.classList.remove('calendar-today');
            }
        
            targetDateElement.classList.add('selected');
            targetDateElement.classList.add('calendar-today');
        
            const selectedDate2 = new Date(calendar2.getFullYear(), calendar2.getMonth(), parseInt(targetDateElement.textContent));
            customDateInput2.value = selectedDate2.toLocaleDateString('en-CA'); // Используем локальное время
            timeInput2.style.display = 'block';
            saveButton2.style.display = 'block';
        },
        
        plotSelectors2: function () {
            calendarContainer2.innerHTML = `
                <div class="calendar-inner">
                    <div class="calendar-controls">
                        <div class="calendar-prev"><a href="#" id="prev-month-btn"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M88.2 3.8L35.8 56.23 28 64l7.8 7.78 52.4 52.4 9.78-7.76L45.58 64l52.4-52.4z"/></svg></a></div>
                        <div class="calendar-year-month">
                            <div class="calendar-month-label"></div>
                            <div>-</div>
                            <div class="calendar-year-label"></div>
                        </div>
                        <div class="calendar-next"><a href="#" id="next-month-btn"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M38.8 124.2l52.4-52.42L99 64l-7.77-7.78-52.4-52.4-9.8 7.77L81.44 64 29 116.42z"/></svg></a></div>
                    </div>
                    <div class="calendar-body"></div>
                    <div class="time-picker-container" style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        ${timeInput2.outerHTML}
                        ${saveButton2.outerHTML}
                    </div>
                </div>`;
        },
        plotDayNames2: function () {
            for (let i = 0; i < this.calWeekDays2.length; i++) {
                calendarContainer2.querySelector(".calendar .calendar-body").innerHTML += `<div>${this.calWeekDays2[i]}</div>`;
            }
        },
        plotDates2: function () {
            const body = calendarContainer2.querySelector(".calendar .calendar-body");
            body.innerHTML = "";
            this.plotDayNames2();
            this.displayMonth2();
            this.displayYear2();
        
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Сброс времени сегодняшнего дня для сравнения
        
            const daysInMonth = this.daysInMonth2(calendar2.getMonth(), calendar2.getFullYear());
            const firstDayOfWeek = this.firstDay2().getDay();
            const prevMonthDays = this.getPreviousMonthLastDate2();
        
            // Добавление дней из предыдущего месяца
            for (let i = 0; i < firstDayOfWeek; i++) {
                body.innerHTML += `<div class="prev-dates" style="color: #484848; pointer-events: none;">${prevMonthDays - firstDayOfWeek + i + 1}</div>`;
            }
        
            // Отображение дней текущего месяца
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(calendar2.getFullYear(), calendar2.getMonth(), day);
                const isPastDate = date < today;
                let classes = "number-item date-item";
                let style = "color: white; cursor: pointer;"; // Стандартный белый цвет текста и стиль курсора
        
                if (isPastDate) {
                    style = "color: #484848; pointer-events: none;"; // Серый цвет для прошедших дней, некликабельные
                    body.innerHTML += `<div class="${classes} prev-dates" style="${style}">${day}</div>`;
                } else {
                    if (date.toDateString() === today.toDateString()) {
                        body.innerHTML += `<div class="${classes} today" style="background-color: #007bff; ${style}">${day}</div>`;
                    } else {
                        body.innerHTML += `<div class="${classes}" data-num="${day}" style="${style}"><a href="#" class="dateNumber">${day}</a></div>`;
                    }
                }
            }
        
            // Добавление дней из следующего месяца
            const remainingDays = 35 - (firstDayOfWeek + daysInMonth);
            for (let i = 1; i <= remainingDays; i++) {
                body.innerHTML += `<div class="next-dates">${i}</div>`;
            }
        
            this.highlightToday2();
        
            // Добавление обработчиков событий для кликабельных дней
            document.querySelectorAll(".dateNumber, .today").forEach(element => {
                element.addEventListener("click", this.selectDate2.bind(this));
            });
        
            // Убедитесь, что обработчики событий для кнопок переключения месяцев не добавляются при каждом вызове plotDates2
            if (!this.eventHandlersAdded2) {
                document.querySelector(".calendar-prev").addEventListener("click", function () {
                    calendarControl2.navigateToPreviousMonth2();
                });
        
                document.querySelector(".calendar-next").addEventListener("click", function () {
                    calendarControl2.navigateToNextMonth2();
                });
                this.eventHandlersAdded2 = true; // Пометить, что обработчики событий установлены
            }
        },
        
        attachEvents2: function () {
            let prevBtn2 = calendarContainer2.querySelector(".calendar .calendar-prev a");
            let nextBtn2 = calendarContainer2.querySelector(".calendar .calendar-next a");
            let dateNumber2 = calendarContainer2.querySelectorAll(".calendar .dateNumber");
            prevBtn2.addEventListener("click", this.navigateToPreviousMonth2.bind(this));
            nextBtn2.addEventListener("click", this.navigateToNextMonth2.bind(this));
            for (let i = 0; i < dateNumber2.length; i++) {
                if (!dateNumber2[i].parentElement.classList.contains('disabled')) {
                    dateNumber2[i].addEventListener("click", this.selectDate2.bind(this), false);
                }
            }
            document.getElementById('save-time-btn').addEventListener('click', this.saveDateTime.bind(this));
        },
        highlightToday2: function () {
            let currentMonth2 = this.localDate2.getMonth();
            let changedMonth2 = calendar2.getMonth();
            let currentYear2 = this.localDate2.getFullYear();
            let changedYear2 = calendar2.getFullYear();
            if (currentYear2 === changedYear2 && currentMonth2 === changedMonth2 && calendarContainer2.querySelectorAll(".number-item")) {
                calendarContainer2.querySelectorAll(".number-item")[calendar2.getDate() - 1].classList.add("calendar-today");
                calendarContainer2.querySelectorAll(".number-item")[calendar2.getDate() - 1].classList.add("selected");
            }
        },
        attachEventsOnNextPrev2: function () {
            this.plotDates2();
            this.attachEvents2();
        },
        saveDateTime: function () {
            const selectedDate = customDateInput2.value;
            const selectedTime = document.getElementById('time-input').value;
        
            if (!selectedDate || !selectedTime) {
                alert("Please select a valid date and time.");
                return;
            }
        
            // Создаем дату с учетом локального времени
            const dateParts = selectedDate.split('-');
            const timeParts = selectedTime.split(':');
            const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);
        
            this.updateTimeLabel2(date, selectedTime);
            calendarContainer2.style.display = 'none'; // Закрываем календарь после сохранения
            updateDeleteButtonVisibility();
            
            

            console.log('Selected Date and Time:', date.toLocaleString(), selectedTime);
        },
        
        resetCalendar: function () {
            // Сбрасываем календарь к началу
            calendar2.setMonth(today.getMonth());
            calendar2.setFullYear(today.getFullYear());
            this.plotDates2();
            customDateInput2.value = '';
            document.getElementById('time-input').value = '';
        },
        
        init2: function () {
            this.plotSelectors2();
            this.plotDates2();
            console.log("Setting up event handlers");
            this.attachEvents2();

            // Set initial time to one hour ahead
            let initialTime = new Date();
            initialTime.setHours(initialTime.getHours() + 1);
            initialTime.setMinutes(0);
            document.getElementById('time-input').value = initialTime.toTimeString().slice(0, 5);

            // Set today's date as selected
            const todayDateElement = calendarContainer2.querySelector(`.date-item[data-num="${today.getDate()}"]`);
            if (todayDateElement) {
                todayDateElement.classList.add('selected');
                todayDateElement.classList.add('calendar-today');
                customDateInput2.value = today.toISOString().split('T')[0];
            }

            // Ensure time input and save button are not duplicated
            if (!calendarContainer2.contains(document.getElementById('time-input'))) {
                calendarContainer2.appendChild(timeInput2);
            }
            if (!calendarContainer2.contains(document.getElementById('save-time-btn'))) {
                calendarContainer2.appendChild(saveButton2);
            }
        }
    };

    calendarControl2.init2();

    document.getElementById('choose-time-btn').addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Choose time button clicked");
        calendarControl2.resetCalendar(); // Сбрасываем календарь при открытии
        showCalendar();
        this.blur();
    });

}

document.addEventListener("DOMContentLoaded", function() {
    CalendarControl2();
});

document.addEventListener('click', function(event) {
    const calendarContainer = document.getElementById('custom-calendar2');
    const datePicker = document.querySelector('.reminder-picker');
    if (!calendarContainer.contains(event.target) && !datePicker.contains(event.target)) {
        calendarContainer.style.display = 'none';
    }
});

function updateDeleteButtonVisibility() {
    const timeLabel = document.getElementById('time-label');
    const deleteButton = document.getElementById('delete-time-btn');
    if (timeLabel.textContent) {
        deleteButton.style.display = 'block';
    } else {
        deleteButton.style.display = 'none';
    }
}
