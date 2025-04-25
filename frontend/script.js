document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appeared');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Анимация появляется, когда элемент виден на 20%

    document.querySelectorAll('.features-list .feature-item').forEach(item => {
        observer.observe(item);
    });

    const businessInquiryButton = document.querySelector('.business-inquiry-button');
    const modal = document.getElementById('businessInquiryModal');
    const closeButton = document.querySelector('.close-button');
    const inquiryForm = document.getElementById('businessInquiryForm');
    const inquiryStatus = document.getElementById('inquiryStatus');

    businessInquiryButton.addEventListener('click', (event) => {
        event.preventDefault();
        modal.style.display = "block";
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    inquiryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(inquiryForm);
        const inquiryData = {};
        formData.forEach((value, key) => {
            inquiryData[key] = value;
        });

        // Здесь вы можете отправить данные формы на свой сервер
        console.log('Данные запроса:', inquiryData);

        // Временно показываем сообщение об успешной отправке
        inquiryStatus.textContent = 'Ваш запрос успешно отправлен. Мы свяжемся с вами в ближайшее время.';
        inquiryStatus.classList.remove('hidden');
        inquiryForm.reset();

        // Через некоторое время скрываем сообщение и закрываем модальное окно
        setTimeout(() => {
            inquiryStatus.classList.add('hidden');
            modal.style.display = "none";
        }, 3000);
    });
});