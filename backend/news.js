const server = require('./server');
const db = server.getDB();

// Получение всех новостей
function getAllNews(req, res) {
    db.all('SELECT * FROM news ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('Ошибка получения новостей:', err);
            return res.status(500).json({ message: 'Ошибка при получении новостей' });
        }
        res.json(rows);
    });
}

// Добавление новости (только от КСК)
function postNews(req, res) {
    const { title, content } = req.body;
    const user = req.user;

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }

    db.run(
        'INSERT INTO news (title, content, author_id) VALUES (?, ?, ?)',
        [title, content, user.userId],
        function (err) {
            if (err) {
                console.error('Ошибка добавления новости:', err);
                return res.status(500).json({ message: 'Ошибка при добавлении новости' });
            }
            res.status(201).json({ message: 'Новость добавлена', newsId: this.lastID });
        }
    );
}

module.exports = { getAllNews, postNews };
