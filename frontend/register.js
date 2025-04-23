document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Отключаем стандартную отправку формы

        const role = document.getElementById('role').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert("Пароли не совпадают!");
            return;
        }

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role, email, password }),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Ошибка при регистрации.');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Успешная регистрация
                console.log('Успешная регистрация:', data);
                alert("Регистрация прошла успешно! Теперь вы можете войти.");
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('Ошибка регистрации:', error);
                alert(error.message);
            });
    });
});
