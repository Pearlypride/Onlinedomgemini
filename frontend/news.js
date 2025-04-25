document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('news-list');

  fetch('/api/news')
    .then(res => res.json())
    .then(news => {
      if (news.length === 0) {
        list.innerHTML = '<p>Пока нет новостей.</p>';
        return;
      }

      news.reverse().forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-item';
        card.innerHTML = `
          <h3>${item.title}</h3>
          <p>${item.content}</p>
          <small>${new Date(item.created_at).toLocaleString()}</small>
          <hr>
        `;
        list.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Ошибка загрузки новостей:', err);
      list.innerHTML = '<p>Не удалось загрузить новости.</p>';
    });
});
