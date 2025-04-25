const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const frontendDir = path.join(__dirname, '..', 'frontend');

app.use(express.json());
app.use(express.static(frontendDir));

const SECRET_KEY = 'supersecretkey';
let db;

const dbPath = path.resolve(__dirname, 'db.sqlite');
const connectDB = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("Ошибка подключения к базе данных:", err.message);
                reject(err);
            } else {
                console.log("✅ Успешное подключение к базе данных SQLite.");
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

// Добавление тестовых пользователей
async function seedUsers() {
    const users = [
        { role: 'user', email: 'user@example.com', password: 'userpass' },
        { role: 'admin', email: 'admin@example.com', password: 'adminpass' },
        { role: 'builder', email: 'builder@example.com', password: 'builderpass' }
    ];

    for (const user of users) {
        const hashed = await bcrypt.hash(user.password, 10);
        db.run(
            'INSERT OR IGNORE INTO users (role, email, password) VALUES (?, ?, ?)',
            [user.role, user.email, hashed],
            (err) => {
                if (err) {
                    console.error(`Ошибка при добавлении пользователя ${user.email}:`, err.message);
                } else {
                    console.log(`👤 Пользователь добавлен или уже существует: ${user.email}`);
                }
            }
        );
    }
}

// Регистрация
app.post('/api/register', async (req, res) => {
    const { role, email, password } = req.body;
    if (!role || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        'INSERT INTO users (role, email, password) VALUES (?, ?, ?)',
        [role, email, hashedPassword],
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Пользователь уже существует или ошибка базы.' });
            }
            res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
        }
    );
});

// Вход
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Ошибка сервера.' });
        if (!user) return res.status(401).json({ message: 'Неверный email или пароль.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Неверный email или пароль.' });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    });
});

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Неверный токен' });
        req.user = user;
        next();
    });
}

// Пример защищённого маршрута
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: `Доступ разрешен для роли: ${req.user.role}` });
});

// Отдаём главную страницу
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(port, async () => {
    console.log(`🚀 Сервер работает: http://localhost:${port}`);
    try {
        await connectDB();
        await seedUsers();
        console.log('📦 Тестовые пользователи добавлены');
    } catch (error) {
        console.error('❌ Ошибка при запуске сервера:', error);
    }
});
