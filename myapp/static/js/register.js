document.addEventListener("DOMContentLoaded", function() {
    const usernameInput = document.getElementById("name");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("password-confirm");
    const emailInput = document.getElementById("email");
    const usernameError = document.getElementById("username-error");
    const passwordError = document.getElementById("password-error");
    const passwordConfirmError = document.getElementById("password-confirm-error");
    const emailError = document.getElementById("email-error");
    const form = document.querySelector("form");

    function displayError(errorElement, message) {
        if (message) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Валидация совпадения паролей и запрет на ввод русских символов
    function validatePasswords() {
        const passwordMatchMessage = passwordInput.value !== passwordConfirmInput.value ? "Пароли не совпадают." : "";
        const regex = /[а-яА-ЯёЁ]/;
        const russianCharacterMessage = regex.test(passwordInput.value) || regex.test(passwordConfirmInput.value) ? "Использование русских символов в пароле запрещено." : "";
        const message = russianCharacterMessage || passwordMatchMessage;
        displayError(passwordError, message);
        displayError(passwordConfirmError, message);
    }

    function validateNotEmpty(inputElement, errorElement, errorMessage) {
        if (!inputElement.value.trim()) {
            displayError(errorElement, errorMessage);
            return false;
        } else {
            displayError(errorElement, "");
            return true;
        }
    }

    passwordInput.addEventListener("input", validatePasswords);
    passwordConfirmInput.addEventListener("input", validatePasswords);

    usernameInput.addEventListener("input", function() {
        if (validateNotEmpty(usernameInput, usernameError, "Поле не может быть пустым.")) {
            fetch(`/check_username/?username=${usernameInput.value}`)
                .then(response => response.json())
                .then(data => {
                    const message = data.is_taken ? "Этот логин уже используется." : "";
                    displayError(usernameError, message);
                });
        }
    });

    emailInput.addEventListener("input", function() {
        if (validateNotEmpty(emailInput, emailError, "Поле не может быть пустым.")) {
            const message = !emailInput.value.includes('@') ? "Email должен содержать символ '@'." : "";
            displayError(emailError, message);
        }
    });

    emailInput.addEventListener("blur", function() {
        if (emailInput.value.includes('@')) {
            fetch(`/check_email/?email=${emailInput.value}`)
                .then(response => response.json())
                .then(data => {
                    const message = data.is_taken ? "Этот email уже используется." : "";
                    displayError(emailError, message);
                });
        }
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Останавливаем отправку формы

        const isUsernameValid = validateNotEmpty(usernameInput, usernameError, "Поле не может быть пустым.");
        const isEmailValid = validateNotEmpty(emailInput, emailError, "Поле не может быть пустым.");
        const isPasswordValid = validateNotEmpty(passwordInput, passwordError, "Поле не может быть пустым.");
        const isPasswordConfirmValid = validateNotEmpty(passwordConfirmInput, passwordConfirmError, "Поле не может быть пустым.");
        validatePasswords(); // Проверка паролей

        if (isUsernameValid && isEmailValid && isPasswordValid && isPasswordConfirmValid) {
            form.submit(); // Отправляем форму, если все поля заполнены и валидны
        }
    });
});
