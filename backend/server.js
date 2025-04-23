const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const frontendDir = path.join(__dirname, '..', 'frontend'); // Путь к папке frontend

app.use(express.json());
app.use(express.static(frontendDir));

let db; // Объявляем db на верхнем уровне

const dbPath = path.resolve(__dirname, 'db.sqlite');
const connectDB = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("Ошибка подключения к базе данных:", err.message);
                reject(err);
            } else {
                console.log("Успешное подключение к базе данных SQLite.");
                db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        role TEXT NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL
                    )
                `, (createTableErr) => {
                    if (createTableErr) {
                        console.error("Ошибка создания таблицы users:", createTableErr.message);
                        reject(createTableErr);
                    } else {
                        resolve(db);
                    }
                });
            }
        });
    });
};

// Маршрут для корневого пути, отправляющий index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

let auth; // Объявляем auth здесь, будем инициализировать позже

app.listen(port, async () => {
    console.log(`Сервер запускается на http://localhost:${port}`);
    try {
        await connectDB();
        auth = require('./auth'); // Инициализируем auth только после подключения к БД

        // Маршруты API (теперь используем auth после его инициализации)
        app.post('/api/register', auth.registerUser);
        app.post('/api/login', auth.loginUser);
        app.get('/api/protected', auth.authenticateToken, (req, res) => {
            res.json({ message: `Доступ разрешен для пользователя с ролью: ${req.user.role}` });
        });

        console.log('Сервер запущен и готов к работе.');

    } catch (error) {
        console.error('Ошибка при запуске сервера:', error);
    }
});

// Экспортируем функцию для получения объекта db
module.exports.getDB = () => db;