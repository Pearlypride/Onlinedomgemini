const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const server = require('./server'); // Импортируем модуль server

const saltRounds = 10;
const jwtSecret = 'your_jwt_secret_key'; // Замените на более сложный секретный ключ

// Функция для регистрации нового пользователя
async function registerUser(req, res) {
    const { role, email, password } = req.body;
    const db = server.getDB(); // Получаем экземпляр db

    console.log('Запрос на регистрацию:', { role, email });

    try {
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (existingUser) {
            console.log('Пользователь с таким email уже существует:', email);
            return res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Пароль успешно хеширован.');

        const result = await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (role, email, password) VALUES (?, ?, ?)', [role, email, hashedPassword], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });

        const userId = result;
        const token = jwt.sign({ userId, role }, jwtSecret, { expiresIn: '1h' });
        console.log('Пользователь успешно зарегистрирован:', { userId, email, role, token });
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован.', token, role });

    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        return res.status(500).json({ message: 'Ошибка базы данных при регистрации пользователя.' });
    }
}

// Функция для аутентификации пользователя
async function loginUser(req, res) {
    const { email, password } = req.body;
    const db = server.getDB(); // Получаем экземпляр db

    console.log('Запрос на логин:', { email });

    db.get('SELECT id, role, password FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Ошибка при поиске пользователя:', err);
            return res.status(500).json({ message: 'Ошибка базы данных при поиске пользователя.' });
        }
        if (!row) {
            console.log('Пользователь не найден.');
            return res.status(401).json({ message: 'Неверный email или пароль.' });
        }

        console.log('Найден пользователь:', { id: row.id, email: email, storedPassword: row.password });

        bcrypt.compare(password, row.password, (compareErr, result) => {
            if (compareErr) {
                console.error('Ошибка при сравнении паролей:', compareErr);
                return res.status(500).json({ message: 'Ошибка при сравнении паролей.' });
            }
            if (result) {
                const token = jwt.sign({ userId: row.id, role: row.role }, jwtSecret, { expiresIn: '1h' });
                console.log('Успешный вход, токен:', token, 'роль:', row.role);
                res.json({ token, role: row.role });
            } else {
                console.log('Неверный пароль.');
                res.status(401).json({ message: 'Неверный email или пароль.' });
            }
        });
    });
}

// Middleware для проверки аутентификации (пример)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const db = server.getDB(); // Получаем экземпляр db

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = { registerUser, loginUser, authenticateToken };