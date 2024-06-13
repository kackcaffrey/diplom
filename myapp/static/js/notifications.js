document.addEventListener('DOMContentLoaded', function () {
    function fetchNotifications() {
        fetch('/myapp/get-notifications/')
            .then(response => response.json())
            .then(data => {
                data.forEach(notification => {
                    showNotification(notification.message, notification.id);
                });
            })
            .catch(error => console.error('Error fetching notifications:', error));
    }

    function showNotification(message, notificationId) {
        const notificationContainer = document.createElement('div');
        notificationContainer.classList.add('notification-container');
        notificationContainer.innerHTML = `
            <div class="notification-message">${message}</div>
        `;

        document.body.appendChild(notificationContainer);

        setTimeout(() => {
            notificationContainer.classList.add('fade-out');
            setTimeout(() => {
                notificationContainer.remove();
            }, 1000);
        }, 10000);

        markNotificationAsRead(notificationId);
    }

    function markNotificationAsRead(notificationId) {
        fetch(`/myapp/mark-notification-as-read/${notificationId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        }).catch(error => console.error('Error marking notification as read:', error));
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

    function startCheckingNotifications() {
        const now = new Date();
        const delay = (60 - now.getSeconds()) * 1000; // вычисляем, сколько миллисекунд осталось до начала следующей минуты

        setTimeout(() => {
            fetchNotifications();
            setInterval(fetchNotifications, 60000); // после первой проверки каждую минуту
        }, delay);
    }

    // Проверка уведомлений при загрузке страницы
    fetchNotifications();

    // Начинаем проверку уведомлений в начале следующей минуты
    startCheckingNotifications();
});

// Добавляем CSS стили для уведомлений
const style = document.createElement('style');
style.innerHTML = `
    .notification-container {
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: #262829;
        color: white;
        padding: 20px; /* Увеличиваем padding */
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: opacity 1s;
        width: 500px; /* Увеличиваем ширину */
        margin-bottom: 10px; /* Отступ снизу */
    }

    .notification-container + .notification-container {
        margin-top: 20px; /* Увеличиваем отступ между уведомлениями */
    }

    .notification-container.fade-out {
        opacity: 0;
    }

    .notification-message {
        margin: 0;
        font-size: 16px; /* Увеличиваем размер шрифта */
    }
`;
document.head.appendChild(style);
