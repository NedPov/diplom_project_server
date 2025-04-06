// ! Работаем с MySQL

// НАСТРОЙКА
// ============================================================================================

// Подключаем файл конфигурации
require('dotenv').config();

// Подключаем основные пакеты
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Подключаем пакеты для работы с токенами/паролем
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Инициализируем приложение
const app = express();

// Обозначаем порт сервера (Обращаемся к файлу .env)
const PORT = process.env.PORT || 5000;
console.log(process.env.PORT);

// Обходим политику cors
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// express работает с json
app.use(express.json());
// Работаем с куки
app.use(cookieParser());



// АДМИНКА
const loginAdmin = process.env.LOGIN_ADMIN || 'admin';
const passAdmin = process.env.PASS_ADMIN || 'password';

// ============================================================================================



// РАБОТА С БД
// ============================================================================================

// Создаем данные для подключение к MySQL  
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
});


// Подключение к MySQL
db.connect(err => {
    // Обработка ошибки
    if (err) return console.error('Ошибка подключения к MySQL', err);
    console.log('Подключено к MySQL');


    // Создаем БД
    db.query(`create database if not exists ${process.env.DB_NAME || 'diplom_error'}`, (err) => {
        if (err) return console.error('Ошибка создания БД', err);
        console.log("БД успешно создана");
    });


    // Переключаемся на нашу БД
    db.changeUser({ database: process.env.DB_NAME || 'diplom' }, (err) => {
        // Обработка ошибки
        if (err) return console.error('Ошибка выбора БД', err);


        //Переменная для создания таблицы РОЛЕЙ
        const createTableRoles = 'create table if not exists roles(id int auto_increment primary key, role varchar(255) unique)';

        // создание таблицы РОЛЕЙ в выбраной БД
        db.query(createTableRoles, (err) => {
            if (err) return console.error('Ошбика создания таблицы ролей', err);
            console.log('Таблица ролей готова к использованию');
        });

        // Добавляем сразу роли admin и user
        db.query('insert ignore into roles(role) values ("admin")');
        db.query('insert ignore into roles(role) values ("user")');



        // Переменная для создания таблицы ПОЛЬЗОВАТЕЛЕЙ
        const createTableUsers = 'create table if not exists users(id int auto_increment primary key not null, username varchar(255) not null unique, password varchar(255) not null, role_id int, foreign key (role_id) references roles(id))';

        // Создание таблицы ПОЛЬЗОВАТЕЛЕЙ в выбраной БД
        db.query(createTableUsers, (err) => {
            // Обработка ответа
            if (err) return console.error('Ошибка создания таблицы пользователей', err);
            console.log('Таблицы пользователей готова к использованию')
        });

        // ТАБЛИЦЫ ПРОДУКЦИИ
        // ===================================================================================================================
        // _________________________________________________
        // Переменная для создания таблицы СЕТОВ
        const createTableProducts = 'create table if not exists products(id int auto_increment primary key, title varchar(255), description varchar(255), price smallint, productType varchar(255))';

        // Создание таблицы СЕТОВ в выбраной БД
        db.query(createTableProducts, (err) => {
            if (err) return console.error('Ошибка создания таблицы продукции', err);
            console.log('Таблица продукции готова к использованию');
        });
        // // _________________________________________________
        // // Переменная для создания таблицы СУШИ
        // const createTableSushi = 'create table if not exists sushi(id int auto_increment primary key, title varchar(255) not null, description varchar(255), price smallint)';

        // // Создание таблицы СУШИ в выбраной БД
        // db.query(createTableSushi, (err) => {
        //     if (err) return console.error('Ошибка создания таблицы суши', err);
        //     console.log('Таблица суши готова к использованию');
        // });
        // // _________________________________________________
        // // Переменная для создания таблицы РОЛЛОВ
        // const createTableRolls = 'create table if not exists rolls(id int auto_increment primary key, title varchar(255) not null, description varchar(255), price smallint)';

        // // Создание таблицы РОЛЛОВ в выбраной БД
        // db.query(createTableRolls, (err) => {
        //     if (err) return console.error('Ошибка создания таблицы роллов', err);
        //     console.log('Таблица роллов готова к использованию');
        // });
        // // _________________________________________________
        // // Переменная для создания таблицы СОУСОВ
        // const createTableSauces = 'create table if not exists sauces(id int auto_increment primary key, title varchar(255) not null, description varchar(255), price smallint)';

        // // Создание таблицы СОУСОВ в выбраной БД
        // db.query(createTableSauces, (err) => {
        //     if (err) return console.error('Ошибка создания таблицы соусов', err);
        //     console.log('Таблица соусов готова к использованию');
        // });
        // // _________________________________________________
        // // Переменная для создания таблицы НАПИТКОВ
        // const createTableDrinks = 'create table if not exists drinks(id int auto_increment primary key, title varchar(255) not null, description varchar(255), price smallint)';

        // // Создание таблицы НАПИТКОВ в выбраной БД
        // db.query(createTableDrinks, (err) => {
        //     if (err) return console.error('Ошибка создания таблицы напитков', err);
        //     console.log('Таблица напитков готова к использованию');
        // });
        // ===================================================================================================================

        // Переменная для создания РЕФРЕШ-ТОКЕНА
        const createTableRefreshTokens = 'create table if not exists refresh_tokens(id int auto_increment primary key, token text not null unique, user_id int not null, foreign key (user_id) references users(id))';

        // Создание таблицы РЕФРЕШ-ТОКЕНОВ в выбраной БД
        db.query(createTableRefreshTokens, (err) => {
            if (err) return console.error("Ошибка создания таблицы рефреш-токенов", err);
            console.log('Таблица рефреш-токенов готова к использованию');
        });
    });
});
// ============================================================================================



// РАБОТА С ТОКЕНАМИ ДОСТУПА
// ============================================================================================

// Генерация токена доступа
const generateAccessToken = (user) => {
    // Подписываем токен
    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role, role_id: user.role_id }, process.env.ACCESS_SECRET, { expiresIn: '15m' });
    return accessToken;
}

// Генерация рефреш-токена
const generateRefreshToken = (user) => {
    // Подписываем токен
    const refreshToken = jwt.sign({ id: user.id, username: user.username, role: user.role, role_id: user.role_id }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

    // Помещаем в таблицу рефреш-токенов
    db.query('insert into refresh_tokens (user_id, token) values (?, ?)', [user.id, refreshToken], (err) => {
        if (err) {
            console.error("Ошибка создания рефреш токена", err);
        } else {
            console.log('Рефреш-токен успешно записан в БД');
        }
    });
    return refreshToken;
};



// ВЕРИФИКАЦИЯ ТОКЕНА ДОСТУПА
const authenticateToken = (req, res, next) => {
    // Получаем токен из заголовка запроса
    const headerAuthToken = req.headers.authorization;
    // С токеном передается еще слово bearer
    const token = headerAuthToken.split(' ')[1];

    // Обработка ошибки
    if (!token) return res.status(403).json({ error: 'Токен не обнаружен. У вас нет доступа' });

    // Проверяем токен
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        // Обработка ошибки
        if (err) return res.status(403).json({ error: 'Невалидный токен. У вас нет доступа' });

        req.user = user;

        next();
    });
};



// Обновление токена доступа
app.post('refresh', async (req, res) => {
    // Достаем токен из куки
    const refreshToken = req.cookies.refreshToken;
    // Обработка ошибки
    if (!refreshToken) return res.status(403).json({ error: 'Refresh-token не обнаружен. У вас нет доступа' });

    // Поиск токена в БД
    db.query('select * from refresh_tokens where token=?', [refreshToken], (err, token) => {
        if (err || !token) return res.status(403), json({ error: 'Refresh-токен не найден' });

        // Проверяем токен
        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
            if (err) return res.status(403).json({ error: 'Невалидный Refresh-токен. У вас нет доступа' });

            // Создаем новый токен доступа
            const newAccessToken = generateAccessToken(user);

            // Отправляем обновленный токен и данные пользователя
            res.json({ accessToken: newAccessToken, user: { id: user.id, username: user.username, role: user.role_id } });
        });
    });
});

// ============================================================================================





// РАБОТА С ВХОДОМ/ВЫХОДОМ И РЕГИСТРАЦИЕЙ
// ============================================================================================

// РЕГИСТРАЦИЯ
app.post('/register', async (req, res) => {
    // Получаем данные пользователя из формы, извлекаем их из тела
    const { username, password } = req.body;

    console.log(username);
    console.log(password);

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Роль пользователя
    let roleName = 'user';

    // Если логин и пароль совпали с теми, что мы прописали - меняем роль на админ
    if (loginAdmin == username && passAdmin == password) {
        roleName = 'admin';
    }


    // Получаем id роли, передав ее в запросе
    db.query('select id from roles where role =?', [roleName], (err, role) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ error: err.message, message: 'Не удалось получить роль пользователя' });

        console.log(role);
        console.log(role[0].id);

        // Выполняем добавление в таблицу users
        db.query('insert into users (username, password, role_id) values (?, ?, ?)', [username, hashedPassword, role[0].id], (err) => {
            // Обработка ошибки
            if (err) return res.status(500).json({ error: err.message });

            // Отправляем сообщение в ответе
            res.json({ message: `Пользователь ${username} успешно зарегистрирован` });

        });
    });

});



//  ВХОД
app.post('/login', async (req, res) => {
    // Получаем данные пользователя из формы, извлекаем их из тела
    const { username, password } = req.body;
    console.log(username);
    console.log(password);

    // Поиск пользователя по БД и объединение с ролью
    db.query('select users.*, roles.role from users, roles where users.role_id=roles.id and username=?', [username], async (err, users) => {

        // Т.к. получаем массив
        const user = users[0];
        console.log(user);

        // если вводить неправильные логин/пароль, то ошибка не выпадает, находится массив user, user = undefined
        if (err || user === undefined) {
            console.log('Ошибка');

            return res.status(400).json({ error: "Неверное имя пользователя" });
        } else {
            console.log('Ошибки не обнаружено');

            // Сравнение введеного пароля и хэшированного пароля из БД
            const isPasswordValid = await bcrypt.compare(password, user.password);
            // Обработка ошибки
            if (!isPasswordValid) return res.status(400).json({ error: 'Неверный пароль' });

            // Генерируем токены и передаем данные пользователя
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);


            // ОТПРАВЛЯЕМ ОТВЕТ
            // Записываем в куки наш рефреш токен
            res.cookie('refreshToken', refreshToken);
            // Передаем токен доступа и информацию о пользователе
            res.json({ accessToken, user: { id: user.id, username: user.username, role: user.role, role_id: user.role_id } });
        }
    });
});



// ВЫХОД И УДАЛЕНИЕ РЕФРЕШ-ТОКЕНА
app.post('/logout', (req, res) => {
    // Достаем токен из куки
    const refreshToken = req.cookies.refreshToken;
    // обработка ошибки
    if (!refreshToken) return res.status(403).json({ error: "Refresh-Токен не обнаружен. У вас нет доступа" });

    // Удаляем из БД
    db.query('delete from refresh_tokens where token = ?', [refreshToken], (err) => {
        // обработка ошибки
        if (err) return res.status(500).json({ error: message });

        // Удаляем токен из куки
        res.clearCookie('refreshToken');
        // Отправляем ответное сообщение
        res.json({ message: 'Refresh-токен удален' });
    });
});

// ============================================================================================





// РАБОТА С ПРОДУКЦИЕЙ
// ============================================================================================

// ПОЛУЧЕНИЕ ПРОДУКЦИИ {
// ПОЛУЧЕНИЕ СЕТОВ
app.get('/sets', authenticateToken, (req, res) => {

    db.query('select * from products where productType = "set"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить сеты' });

        res.json(results);
    });
});

// ПОЛУЧЕНИЕ СУШИ
app.get('/sushi', authenticateToken, (req, res) => {
    db.query('select * from products where productType = "sushi"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить суши' });

        res.json(results);
    });
});

// ПОЛУЧЕНИЕ РОЛЛОВ
app.get('/rolls', authenticateToken, (req, res) => {
    db.query('select * from products where productType = "roll"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить роллы' });

        res.json(results);
    });
});

// ПОЛУЧЕНИЕ СОУСОВ
app.get('/sauces', authenticateToken, (req, res) => {
    db.query('select * from products where productType = "sauces"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить соусы' });

        res.json(results);
    });
});

// ПОЛУЧЕНИЕ НАПИТКОВ
app.get('/drinks', authenticateToken, (req, res) => {
    db.query('select * from products where productType = "drinks"', (err, results) => {
        if (err) return res.status(500).json({ error: err.message, message: 'Не получилось получить напитки' });

        res.json(results);
    });
});
// }



// ДОБАВЛЕНИЕ ПРОДУКЦИИ{
app.post('/addProducts', authenticateToken, (req, res) => {
    // Достаем данные из запроса, из тела
    const { title, description, price, productType } = req.body;
    console.log({ title, description, price, productType });
    // Добваляем сет в БД
    db.query('insert into products(title, description, price, productType) values (?, ?, ?, ?)', [title, description, price, productType], (err, result) => {
        if (err) return res.status(500).json({ message: 'Не получилось добавить сет', error: err.message });
        // Отправляем ответ
        res.json({ id: result.insertId, title, description, price, productType });
    });
});
// // СУШИ
// app.post('/sushi', authenticateToken, (req, res) => {
//     // Достаем данные из запроса, из тела
//     const { title, description, price } = req.body;
//     // Добваляем суши в БД
//     db.query('insert into sushi(title, description, price) values (?, ?, ?)', [title, description, price], (err, result) => {
//         if (err) return res.status(500).json({ message: 'Не получилось добавить суши', error: err.message });
//         // Отправляем ответ
//         res.json({ id: result.insertId, title, description, price });
//     });
// });
// // РОЛЛЫ
// app.post('/rolls', authenticateToken, (req, res) => {
//     // Достаем данные из запроса, из тела
//     const { title, description, price } = req.body;
//     // Добваляем роллы в БД
//     db.query('insert into rolls(title, description, price) values (?, ?, ?)', [title, description, price], (err, result) => {
//         if (err) return res.status(500).json({ message: 'Не получилось добавить роллы', error: err.message });
//         // Отправляем ответ
//         res.json({ id: result.insertId, title, description, price });
//     });
// });
// // СОУСЫ
// app.post('/sauces', authenticateToken, (req, res) => {
//     // Достаем данные из запроса, из тела
//     const { title, description, price } = req.body;
//     // Добваляем соусы в БД
//     db.query('insert into sauces(title, description, price) values (?, ?, ?)', [title, description, price], (err, result) => {
//         if (err) return res.status(500).json({ message: 'Не получилось добавить соусы', error: err.message });
//         // Отправляем ответ
//         res.json({ id: result.insertId, title, description, price });
//     });
// });
// // НАПИТКИ
// app.post('/drinks', authenticateToken, (req, res) => {
//     // Достаем данные из запроса, из тела
//     const { title, description, price } = req.body;
//     // Добваляем напитки в БД
//     db.query('insert into drinks(title, description, price) values (?, ?, ?)', [title, description, price], (err, result) => {
//         if (err) return res.status(500).json({ message: 'Не получилось добавить напитки', error: err.message });
//         // Отправляем ответ
//         res.json({ id: result.insertId, title, description, price });
//     });
// });
// // }

// ИЗМЕНЕНИЕ ПРОДУКЦИИ{
// СЕТЫ
app.put('/sets/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Извлекаем данные из формы
    const { title, description, price } = req.body;

    // Меняем значения сета 
    db.query('update sets set title = ?, description = ?, price = ? where id = ?', [title, description, price, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус сетов', error: err.message });
        // Отправляем ответ
        res.json({ message: 'Статус сета изменен', setsEdit: { title, description, price } });
    });
});

// СУШИ
app.put('/sushi/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Извлекаем данные из формы
    const { title, description, price } = req.body;

    // Меняем значения суши 
    db.query('update sushi set title = ?, description = ?, price = ? where id = ?', [title, description, price, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус суши', error: err.message });
        // Отправляем ответ
        res.json({ message: 'Статус суши изменен', sushiEdit: { title, description, price } });
    });
});

// РОЛЛЫ
app.put('/rolls/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Извлекаем данные из формы
    const { title, description, price } = req.body;

    // Меняем значения роллов 
    db.query('update rolls set title = ?, description = ?, price = ? where id = ?', [title, description, price, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус роллов', error: err.message });
        // Отправляем ответ
        res.json({ message: 'Статус роллов изменен', rollsEdit: { title, description, price } });
    });
});

// СОУСЫ
app.put('/sauces/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Извлекаем данные из формы
    const { title, description, price } = req.body;

    // Меняем значения соуса 
    db.query('update sauces set title = ?, description = ?, price = ? where id = ?', [title, description, price, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус соуса', error: err.message });
        // Отправляем ответ
        res.json({ message: 'Статус соуса изменен', saucesEdit: { title, description, price } });
    });
});

// НАПИТКИ
app.put('/drinks/:id/edit', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;
    // Извлекаем данные из формы
    const { title, description, price } = req.body;

    // Меняем значения напитка 
    db.query('update drinks set title = ?, description = ?, price = ? where id = ?', [title, description, price, id], (err, result) => {
        // обработка ошибки
        if (err) return res.status(500).json({ message: 'Не удалось изменить статус напитка', error: err.message });
        // Отправляем ответ
        res.json({ message: 'Статус напитка изменен', drinksEdit: { title, description, price } });
    });
});
// }


// УДАЛЕНИЕ ПРОДУКЦИИ{
// СЕТЫ
app.delete('/sets/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from sets where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления сеты" });
        res.json({ message: 'Сет удален', id });
    });
});

// СУШИ
app.delete('/sushi/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from sushi where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления суши" });
        res.json({ message: 'Суши удалены' });
    });
});

// РОЛЛЫ
app.delete('/rolls/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from rolls where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления роллов" });
        res.json({ message: 'Роллы удалены' });
    });
});

// СОУСЫ
app.delete('/sauces/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from sauces where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления соуса" });
        res.json({ message: 'Соус удален' });
    });
});

// НАПИТКИ
app.delete('/drinks/:id', authenticateToken, (req, res) => {
    // Извлекаем id задачи из параметров адресной строки
    const { id } = req.params;

    // Запрос на удаление
    db.query('delete from drinks where id = ?', [id], (err) => {
        // Обработка ошибки
        if (err) return res.status(500).json({ message: "Ошибка удаления напитка" });
        res.json({ message: 'Напиток удален' });
    });
});
// }
// ============================================================================================




// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен по адресу http://localhost:${PORT}`);
});

