document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    const dashboardModules = document.querySelectorAll('.dashboard-module');

    // Функция для скрытия всех модулей
    function hideAllModules() {
        dashboardModules.forEach(module => {
            module.classList.remove('active');
        });
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
    }

    // Функция для отображения выбранного модуля
    function showModule(moduleId) {
        const moduleToShow = document.getElementById(moduleId + '-module');
        const activeLink = document.querySelector(`.sidebar ul li a[data-module="${moduleId}"]`);

        if (moduleToShow && activeLink) {
            moduleToShow.classList.add('active');
            activeLink.classList.add('active');
        }
    }

    // Обработчик кликов по ссылкам в боковой панели
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Предотвращаем переход по ссылке
            const moduleId = this.getAttribute('data-module');
            hideAllModules();
            showModule(moduleId);
        });
    });

    // По умолчанию показываем модуль "Мои обращения"
    showModule('my-requests');
});