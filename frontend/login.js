document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем стандартную отправку формы

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const email = emailInput.value;
        const password = passwordInput.value;

        // Отправляем данные на бэкенд API для логина
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || 'Ошибка при входе.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Обработка успешного входа
            console.log('Успешный вход:', data);
            localStorage.setItem('authToken', data.token); // Сохраняем токен
            localStorage.setItem('userRole', data.role);   // Сохраняем роль пользователя
            window.location.href = 'user-dashboard.html'; // Перенаправляем в личный кабинет
        })
        .catch(error => {
            // Обработка ошибки входа
            console.error('Ошибка входа:', error);
            alert(error.message); // Показываем сообщение об ошибке пользователю
        });
    });
});