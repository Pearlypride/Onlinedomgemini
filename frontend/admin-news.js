document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('news-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const token = localStorage.getItem('authToken');

    fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ title, content })
    })
    .then(res => res.json())
    .then(data => {
      alert('Новость опубликована!');
      form.reset();
    })
    .catch(err => {
      console.error('Ошибка публикации:', err);
      alert('Ошибка публикации новости');
    });
  });
});
