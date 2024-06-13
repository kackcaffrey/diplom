document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector("form");
    const loginInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginError = document.getElementById("username-error2");
    const passwordError = document.getElementById("password-error2");

    function displayError(element, message) {
        if (message) {
            element.textContent = message;
            element.style.display = 'block';
        } else {
            element.textContent = '';
            element.style.display = 'none';
        }
    }

    function validateInput() {
        const loginMessage = loginInput.value ? "" : "Логин не может быть пустым.";
        const passwordMessage = passwordInput.value ? "" : "Пароль не может быть пустым.";
        const regex = /[а-яА-ЯёЁ]/;
        const russianCharacterMessage = regex.test(passwordInput.value) ? "Использование русских символов в пароле запрещено." : "";

        displayError(loginError, loginMessage);
        displayError(passwordError, passwordMessage || russianCharacterMessage);

        return !loginMessage && !passwordMessage && !russianCharacterMessage;
    }
    
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault(); 
        if (validateInput()) {
            const formData = new FormData(loginForm);
            fetch("/login/", {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',  
                },
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error || 'Ошибка аутентификации');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            })
            .catch(error => {
                console.error('Error:', error.message);
                displayError(loginError, error.message);
            });
        }
    });
});
