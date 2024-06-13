document.addEventListener("DOMContentLoaded", function() {
    const paramsIcon = document.getElementById('params-icon');

    const paramsMenu = document.createElement('div');
    paramsMenu.id = 'params-menu';
    paramsMenu.classList.add('params-menu', 'hidden');
    paramsMenu.innerHTML = `
        <h2 class="params-header">Параметры списка</h2>
        <div class="menu-divider"></div>
        <div class="params-item" id="change-theme">Изменить тему</div>
        <div class="menu-divider"></div>
        <div class="params-item" id="print-list">Печать списка</div>
    `;
    document.body.appendChild(paramsMenu);

    const printButton = document.getElementById('print-list');
    const changeThemeButton = document.getElementById('change-theme');

    paramsIcon.addEventListener('click', function(event) {
        event.stopPropagation();
        paramsMenu.classList.toggle('hidden');
        paramsMenu.style.top = paramsIcon.getBoundingClientRect().bottom + 'px';
        paramsMenu.style.left = paramsIcon.getBoundingClientRect().left + 'px';
    });

    document.addEventListener('click', function(event) {
        const themeMenu = document.querySelector('.theme-menu');
        if (!paramsMenu.contains(event.target) && event.target !== paramsIcon) {
            paramsMenu.classList.add('hidden');
        }
        if (themeMenu && !themeMenu.contains(event.target) && event.target !== changeThemeButton) {
            themeMenu.remove();
        }
    });

    printButton.addEventListener('click', function() {
        document.body.classList.add('print-mode');
        window.print();
        document.body.classList.remove('print-mode');
    });

    changeThemeButton.addEventListener('click', function() {
        toggleThemeMenu();
    });

    function toggleThemeMenu() {
        const existingThemeMenu = document.querySelector('.theme-menu');
        if (existingThemeMenu) {
            existingThemeMenu.remove();
            return;
        }

        const themeMenu = document.createElement('div');
        themeMenu.classList.add('theme-menu');
        themeMenu.innerHTML = `
            <div class="theme-option" data-color="#0078d4" style="background-color: #0078d4;"></div>
            <div class="theme-option" data-color="#ff4500" style="background-color: #ff4500;"></div>
            <div class="theme-option" data-color="#8a2be2" style="background-color: #8a2be2;"></div>
            <div class="theme-option" data-color="#32cd32" style="background-color: #32cd32;"></div>
            <div class="theme-option" data-color="#00ced1" style="background-color: #00ced1;"></div>
            <div class="theme-option" data-color="#ffffff" style="background-color: #ffffff;"></div>
        `;
        document.body.appendChild(themeMenu);
        themeMenu.style.position = 'absolute';
        themeMenu.style.top = paramsIcon.getBoundingClientRect().bottom + 'px';
        themeMenu.style.left = paramsIcon.getBoundingClientRect().left + 'px';

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', function() {
                applyTheme(this.dataset.color);
                saveThemeColor(this.dataset.color);
                themeMenu.remove();
            });
        });
    }

    function applyTheme(color) {
        document.body.style.color = color;
        document.querySelectorAll('.fa, .sort-button, .task-input-collapsed, .task-text, .fa-plus').forEach(el => {
            el.style.color = color;
        });
        const placeholderStyle = document.createElement('style');
        placeholderStyle.innerHTML = `.task-input-collapsed::placeholder { color: ${color}; }`;
        document.head.appendChild(placeholderStyle);
        document.querySelectorAll('.star-icon').forEach(el => {
            el.style.stroke = color;
        });
    }

    function saveThemeColor(color) {
        fetch('/set_theme_color/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ color: color })
        }).then(response => response.json()).then(data => {
            if (data.success) {
                console.log('Theme color saved successfully.');
            } else {
                console.error('Failed to save theme color.');
            }
        });
    }

    function loadThemeColor() {
        fetch('/get_theme_color/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            if (data.color) {
                applyTheme(data.color);
            } else {
                applyTheme('#ffffff');
            }
        });
    }

    loadThemeColor();

    const style = document.createElement('style');
    style.innerHTML = `
        .params-menu {
            position: absolute;
            background-color: #262829;
            border: 1px solid #555;
            border-radius: 5px;
            padding: 10px;
            z-index: 1000;
            width: 200px;
            color: #ffffff;
        }

        .params-menu.hidden {
            display: none;
        }

        .params-header {
            font-size: 16px;
            margin: 0;
            padding: 10px 0;
        }

        .menu-divider {
            height: 1px;
            background-color: #444;
            width: 107%;
            margin-left: -5%;
        }

        .params-menu .params-item {
            padding: 10px;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
        }

        .params-menu .params-item:hover {
            background-color: #333;
        }

        .theme-menu {
            display: flex;
            gap: 10px;
            padding: 10px;
            background-color: #262829;
            border: 1px solid #555;
            border-radius: 5px;
            position: absolute;
            z-index: 1000;
        }

        .theme-option {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
        }

        @media print {
            body.print-mode #search-status,
            body.print-mode #completed-count,
            body.print-mode .arrow,
            body.print-mode h3 {
                display: none !important;
            }

            body.print-mode header,
            body.print-mode .sidebar,
            body.print-mode .footer,
            body.print-mode .params-menu,
            body.print-mode .theme-menu,
            body.print-mode .search-bar,
            body.print-mode .sort-menu,
            body.print-mode .completed-task-item,
            body.print-mode .other-elements-to-hide,
            body.print-mode #params-icon,
            body.print-mode .task-header,
            body.print-mode .add-task-button,
            body.print-mode .sorting-options,
            body.print-mode .settings-icon,
            body.print-mode .completed-task-list,
            body.print-mode .completed-task-header,
            body.print-mode .task-entry,
            body.print-mode .plus-icon,
            body.print-mode .fa,
            body.print-mode .sort-button,
            body.print-mode .fa-plus,
            body.print-mode .logo,
            body.print-mode .profile-info,
            body.print-mode .app-header,
            body.print-mode .task-list-title,
            body.print-mode .sidebar,
            body.print-mode .task-section-header,
            body.print-mode .task-list-header,
            body.print-mode .header,
            body.print-mode .search-input,
            body.print-mode .task-input,
            body.print-mode .task-details,
            body.print-mode .completed-tasks,
            body.print-mode .completed-header,
            body.print-mode .completed-item,
            body.print-mode .profile {
                display: none !important;
            }

            body.print-mode .new-task-item {
                display: block !important;
                padding: 10px !important;
                margin: 5px 0 !important;
                border: 1px solid #ccc !important;
                border-radius: 5px !important;
                background-color: #fff !important;
                text-align: left !important;
            }

            body.print-mode .new-task-item .additional-info,
            body.print-mode .new-task-item .star-icon,
            body.print-mode .new-task-item .fa,
            body.print-mode .new-task-item .new-task-checkbox {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

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
});
