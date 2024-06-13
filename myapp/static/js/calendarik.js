// Ensure that the function to close the calendar when clicking outside is defined correctly
document.addEventListener('click', function(event) {
    const calendarContainer = document.getElementById('custom-calendar');
    const datePicker = document.querySelector('.date-picker');
    if (calendarContainer && datePicker) {
        const isClickInside = calendarContainer.contains(event.target) || datePicker.contains(event.target);

        if (!isClickInside && calendarContainer.style.display === 'block') {
            calendarContainer.style.display = 'none';
            datePicker.classList.remove('visible');
            datePicker.classList.add('hidden');
        }
    } else {
        console.error("Элементы 'custom-calendar' или '.date-picker' не найдены");
    }
});

// Function to format the date label
function formatDateLabel(date) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
}

// Function to update the date label
function updateDateLabel(text) {
    const dateLabel = document.getElementById('date-label');
    dateLabel.textContent = text;
    if (text) {
        dateLabel.style.visibility = 'visible';
        const deleteButton = document.getElementById('delete-date-btn');
        deleteButton.style.display = 'block';
    } else {
        dateLabel.style.visibility = 'hidden';
        const deleteButton = document.getElementById('delete-date-btn');
        deleteButton.style.display = 'none';
    }
}

// Function to toggle the visibility of the delete button
function toggleDeleteButtonVisibility() {
    const customDateInput = document.getElementById('custom-date');
    const deleteButton = document.getElementById('delete-date-btn');
    if (customDateInput.value) {
        deleteButton.style.display = 'block';
    } else {
        deleteButton.style.display = 'none';
    }
}

function CalendarControl() {
    const calendar = new Date();
    const customDateInput = document.getElementById('custom-date');
    if (!customDateInput) {
        console.error("Элемент 'custom-date' не найден");
        return;
    }
    const calendarControl = {
        localDate: new Date(),
        prevMonthLastDate: null,
        calWeekDays: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
        calMonthName: [
            "Янв", "Фев", "Март", "Апр", "Май", "Июнь",
            "Июль", "Авг", "Сен", "Окт", "Ноя", "Дек"
        ],
        daysInMonth: function (month, year) {
            return new Date(year, month, 0).getDate();
        },
        firstDay: function () {
            return new Date(calendar.getFullYear(), calendar.getMonth(), 1);
        },
        lastDay: function () {
            return new Date(calendar.getFullYear(), calendar.getMonth() + 1, 0);
        },
        firstDayNumber: function () {
            return calendarControl.firstDay().getDay() + 1;
        },
        lastDayNumber: function () {
            return calendarControl.lastDay().getDay() + 1;
        },
        getPreviousMonthLastDate: function () {
            let lastDate = new Date(
                calendar.getFullYear(),
                calendar.getMonth(),
                0
            ).getDate();
            return lastDate;
        },
        navigateToPreviousMonth: function () {
            calendar.setMonth(calendar.getMonth() - 1);
            calendarControl.attachEventsOnNextPrev();
        },
        navigateToNextMonth: function () {
            calendar.setMonth(calendar.getMonth() + 1);
            calendarControl.attachEventsOnNextPrev();
        },
        navigateToCurrentMonth: function () {
            let currentMonth = calendarControl.localDate.getMonth();
            let currentYear = calendarControl.localDate.getFullYear();
            calendar.setMonth(currentMonth);
            calendar.setYear(currentYear);
            calendarControl.attachEventsOnNextPrev();
        },
        displayYear: function () {
            let yearLabel = document.querySelector(".calendar .calendar-year-label");
            if (yearLabel) {
                yearLabel.innerHTML = calendar.getFullYear();
            } else {
                console.error("Элемент '.calendar-year-label' не найден");
            }
        },
        displayMonth: function () {
            let monthLabel = document.querySelector(".calendar .calendar-month-label");
            if (monthLabel) {
                monthLabel.innerHTML = calendarControl.calMonthName[calendar.getMonth()];
            } else {
                console.error("Элемент '.calendar-month-label' не найден");
            }
        },
        selectDate: function (e) {
            e.preventDefault();
            const selectedDate = new Date(calendar.getFullYear(), calendar.getMonth(), e.target.textContent);
            customDateInput.value = selectedDate.toISOString().split('T')[0];
            let labelText = formatDateLabel(selectedDate) + ", " + selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
            if (selectedDate.getFullYear() !== 2024) {
                labelText += ", " + selectedDate.getFullYear();
            }
            updateDateLabel(labelText);
            toggleDeleteButtonVisibility();
            document.getElementById('custom-calendar').style.display = 'none';
            document.querySelector('.date-picker').classList.remove('visible');
            document.querySelector('.date-picker').classList.add('hidden');
            document.querySelector('.task-date-container').classList.add('selected');
        },
        plotSelectors: function () {
            const calendarElement = document.querySelector(".calendar");
            if (calendarElement) {
                calendarElement.innerHTML += `<div class="calendar-inner">
                    <div class="calendar-controls">
                        <div class="calendar-prev"><a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M88.2 3.8L35.8 56.23 28 64l7.8 7.78 52.4 52.4 9.78-7.76L45.58 64l52.4-52.4z"/></svg></a></div>
                        <div class="calendar-year-month">
                            <div class="calendar-month-label"></div>
                            <div>-</div>
                            <div class="calendar-year-label"></div>
                        </div>
                        <div class="calendar-next"><a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M38.8 124.2l52.4-52.42L99 64l-7.77-7.78-52.4-52.4-9.8 7.77L81.44 64 29 116.42z"/></svg></a></div>
                    </div>
                    <div class="calendar-body"></div>
                </div>`;
            } else {
                console.error("Элемент '.calendar' не найден");
            }
        },
        plotDayNames: function () {
            const calendarBody = document.querySelector(".calendar .calendar-body");
            if (calendarBody) {
                for (let i = 0; i < calendarControl.calWeekDays.length; i++) {
                    calendarBody.innerHTML += `<div>${calendarControl.calWeekDays[i]}</div>`;
                }
            } else {
                console.error("Элемент '.calendar-body' не найден");
            }
        },
        plotDates: function () {
            const body = document.querySelector(".calendar .calendar-body");
            if (body) {
                body.innerHTML = "";
                calendarControl.plotDayNames();
                calendarControl.displayMonth();
                calendarControl.displayYear();
            
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Сброс времени сегодняшнего дня для сравнения
            
                const daysInMonth = calendarControl.daysInMonth(calendar.getMonth() + 1, calendar.getFullYear());
                const firstDayOfWeek = calendarControl.firstDay().getDay();
                const prevMonthDays = calendarControl.getPreviousMonthLastDate();
            
                // Добавление дней из предыдущего месяца
                for (let i = 0; i < firstDayOfWeek; i++) {
                    body.innerHTML += `<div class="prev-dates" style="color: #484848; pointer-events: none;">${prevMonthDays - firstDayOfWeek + i + 1}</div>`;
                }
            
                // Отображение дней текущего месяца
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(calendar.getFullYear(), calendar.getMonth(), day);
                    const isPastDate = date < today;
                    let classes = "date number-item";
                    let style = "color: white; cursor: pointer;"; // Стандартный белый цвет текста и стиль курсора
            
                    if (isPastDate) {
                        style = "color: #484848; pointer-events: none;"; // Серый цвет для прошедших дней, некликабельные
                        body.innerHTML += `<div class="${classes} past-date" style="${style}">${day}</div>`;
                    } else {
                        if (date.toDateString() === today.toDateString()) {
                            body.innerHTML += `<div class="${classes} today" style="background-color: #007bff; ${style}">${day}</div>`;
                        } else {
                            body.innerHTML += `<div class="${classes}" data-num="${day}" style="${style}"><a href="#" class="dateNumber">${day}</a></div>`;
                        }
                    }
                }
            
                // Добавление обработчиков событий для кликабельных дней
                document.querySelectorAll(".dateNumber, .today").forEach(element => {
                    element.addEventListener("click", calendarControl.selectDate);
                });
            
                // Убедитесь, что обработчики событий для кнопок переключения месяцев не добавляются при каждом вызове plotDates
                if (!calendarControl.eventHandlersAdded) {
                    const prevBtn = document.querySelector(".calendar-prev");
                    const nextBtn = document.querySelector(".calendar-next");
                    if (prevBtn && nextBtn) {
                        prevBtn.addEventListener("click", function () {
                            calendarControl.navigateToPreviousMonth();
                        });
                    
                        nextBtn.addEventListener("click", function () {
                            calendarControl.navigateToNextMonth();
                        });
                        calendarControl.eventHandlersAdded = true; // Пометить, что обработчики событий установлены
                    } else {
                        console.error("Элементы '.calendar-prev' или '.calendar-next' не найдены");
                    }
                }
            
                calendarControl.highlightToday();
            
                const prevMonthDatesArray = [];
                calendarControl.plotPrevMonthDates(prevMonthDatesArray);
                calendarControl.plotNextMonthDates();
            } else {
                console.error("Элемент '.calendar-body' не найден");
            }
        },
        
        attachEvents: function () {
            const prevBtn = document.querySelector(".calendar .calendar-prev a");
            const nextBtn = document.querySelector(".calendar .calendar-next a");
            const todayDate = document.querySelector(".calendar .calendar-today-date");
            const dateNumber = document.querySelectorAll(".calendar .dateNumber");
            if (prevBtn) {
                prevBtn.addEventListener(
                    "click",
                    calendarControl.navigateToPreviousMonth
                );
            } else {
                console.error("Элемент '.calendar-prev a' не найден");
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", calendarControl.navigateToNextMonth);
            } else {
                console.error("Элемент '.calendar-next a' не найден");
            }
            if (todayDate) {
                todayDate.addEventListener(
                    "click",
                    calendarControl.navigateToCurrentMonth
                );
            }
            if (dateNumber) {
                for (var i = 0; i < dateNumber.length; i++) {
                    if (!dateNumber[i].parentElement.classList.contains('past-date')) {
                        dateNumber[i].addEventListener(
                            "click",
                            calendarControl.selectDate,
                            false
                        );
                    }
                }
            } else {
                console.error("Элементы '.calendar .dateNumber' не найдены");
            }
        },
        highlightToday: function () {
            let currentMonth = calendarControl.localDate.getMonth() + 1;
            let changedMonth = calendar.getMonth() + 1;
            let currentYear = calendarControl.localDate.getFullYear();
            let changedYear = calendar.getFullYear();
            if (
                currentYear === changedYear &&
                currentMonth === changedMonth &&
                document.querySelectorAll(".number-item")
            ) {
                const numberItems = document.querySelectorAll(".number-item");
                if (numberItems[calendar.getDate() - 1]) {
                    numberItems[calendar.getDate() - 1].classList.add("calendar-today");
                } else {
                    console.error("Элемент '.number-item' для текущей даты не найден");
                }
            }
        },
        plotPrevMonthDates: function (dates) {
            dates.reverse();
            const prevDates = document.querySelectorAll(".prev-dates");
            if (prevDates.length) {
                for (let i = 0; i < dates.length; i++) {
                    if (prevDates[i]) {
                        prevDates[i].textContent = dates[i];
                    } else {
                        console.error("Элемент '.prev-dates' для предыдущей даты не найден");
                    }
                }
            } else {
                console.error("Элементы '.prev-dates' не найдены");
            }
        },
        plotNextMonthDates: function () {
            const childElemCount = document.querySelector('.calendar-body').childElementCount;
            //7 lines
            if (childElemCount > 42) {
                let diff = 49 - childElemCount;
                calendarControl.loopThroughNextDays(diff);
            }

            //6 lines
            if (childElemCount > 35 && childElemCount <= 42) {
                let diff = 42 - childElemCount;
                calendarControl.loopThroughNextDays(42 - childElemCount);
            }

        },
        loopThroughNextDays: function (count) {
            if (count > 0) {
                for (let i = 1; i <= count; i++) {
                    document.querySelector('.calendar-body').innerHTML += `<div class="next-dates">${i}</div>`;
                }
            }
        },
        attachEventsOnNextPrev: function () {
            calendarControl.plotDates();
            calendarControl.attachEvents();
        },
        init: function () {
            calendarControl.plotSelectors();
            calendarControl.plotDates();
            calendarControl.attachEvents();
        }
        
    };
    calendarControl.init();
}

const calendarControl = new CalendarControl();
