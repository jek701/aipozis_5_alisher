// Импортируем необходимые модули
const http = require('http');
const fs = require('fs');
const path = require('path');
const {program} = require('commander');
const moment = require("moment");

// Объявляем аргументы командной строки с использованием commander.js
program
    .option('-a, --address <address>', 'Server address', 'localhost')
    .option('-p, --port <port>', 'Server port', 8080)
    .option('-d, --directory <directory>', 'Directory to serve', './public')
    .option('-l, --log-file <logFile>', 'Log file', 'server.log')
    .parse(process.argv);

// Получаем опции из командной строки
const options = program.opts();

// Функция для логирования событий сервера в файл
function logToFile(logFile, message) {
    fs.appendFile(logFile, message + '\n', (err) => {
        if (err) console.error(`Failed to write to log file: ${err}`);
    });
}

// Обработчик GET запросов
function handleGetRequest(req, res, filePath) {
    // Записываем информацию о запросе в лог-файл
    logToFile(options.logFile, `Запрос: ${req.method} ${req.url} - Дата и время: ${moment().format("DD.MM.YYYY, HH:mm")}`);
    // Проверяем существование файла
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.end('Not Found');
        } else {
            res.setHeader('Access-Control-Allow-Origin', 'https://aa-project.by');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            // Отправляем файл
            fs.createReadStream(filePath).pipe(res);
        }
    });
}

// Обработчик POST запросов
function handlePostRequest(req, res, filePath) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        // Записываем данные в файл
        fs.writeFile(filePath, body, (err) => {
            if (err) {
                res.statusCode = 500;
                res.end('Ошибка с сервером');
            } else {
                // Записываем информацию о запросе в лог-файл
                logToFile(options.logFile, `Запрос: ${req.method} ${req.url} - Был загружен файл: ${filePath} - Дата и время: ${moment().format("DD.MM.YYYY, HH:mm")}`);
                res.statusCode = 201;
                res.end('Файл создан или обновлен');
            }
        });
    });
}

// Обработчик OPTIONS запросов
function handleOptionsRequest(req, res, filePath) {
    const newFileName = req.headers['x-new-file-name'];

    if (!newFileName) {
        res.statusCode = 400;
        res.end('Плохой запрос: Не хватает X-New-File-Name header');
        return;
    }


    const newFilePath = path.join(options.directory, newFileName);

// Записываем информацию о запросе в лог-файл
    logToFile(options.logFile, `Запрос: ${req.method} ${req.url} - Старый файл: ${filePath} - Новый файл: ${newFilePath} - Дата и время: ${moment().format("DD.MM.YYYY, HH:mm")}`);

// Переименовываем файл
    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            res.statusCode = 500;
            res.end('Ошибка с сервером');
        } else {
            res.statusCode = 200;
            res.end('Файл переименован');
        }
    });
}

// Создаем и настраиваем HTTP сервер
const server = http.createServer((req, res) => {
    const { method, url: reqUrl } = req;
    const parsedUrl = new URL(reqUrl, `http://${options.address}:${options.port}`);
    const filePath = path.join(options.directory, parsedUrl.pathname);

    if (method === 'GET') {
        handleGetRequest(req, res, filePath);
    } else if (method === 'POST') {
        handlePostRequest(req, res, filePath);
    } else if (method === 'OPTIONS') {
        handleOptionsRequest(req, res, filePath);
    } else {
        // Обработка не поддерживаемых методов
        res.statusCode = 405;
        res.end('Метод не разрешен');
    }
});

// Запускаем сервер и слушаем определенный адрес и порт
server.listen(options.port, options.address, () => {
    console.log(`Сервер запущен на http://${options.address}:${options.port}`)})