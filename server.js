const http = require('http');
const fs = require('fs');
const path = require('path');
const {program} = require('commander');
const moment = require("moment");

program
    .option('-a, --address <address>', 'Server address', 'localhost')
    .option('-p, --port <port>', 'Server port', 8080)
    .option('-d, --directory <directory>', 'Directory to serve', './public')
    .option('-l, --log-file <logFile>', 'Log file', 'server.log')
    .parse(process.argv);

const options = program.opts();

function logToFile(logFile, message) {
    fs.appendFile(logFile, message + '\n', (err) => {
        if (err) console.error(`Failed to write to log file: ${err}`);
    });
}

const server = http.createServer((req, res) => {
    const {method, url: reqUrl} = req;
    const parsedUrl = new URL(reqUrl, `http://${options.address}:${options.port}`);
    const filePath = path.join(options.directory, parsedUrl.pathname);

    if (method === 'GET') {
        logToFile(options.logFile, `Request: ${method} ${reqUrl} - Date: ${moment().format("DD.MM.YYYY, HH:mm")}`);
        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                res.statusCode = 404;
                res.end('Not Found');
            } else {
                res.setHeader('Access-Control-Allow-Origin', 'https://my-cool-site.com');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                fs.createReadStream(filePath).pipe(res);
            }
        });
    } else if (method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            fs.writeFile(filePath, body, (err) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                } else {
                    logToFile(options.logFile, `Request: ${method} ${reqUrl} - File uploaded: ${filePath} - Date: ${moment().format("DD.MM.YYYY, HH:mm")}`);
                    res.statusCode = 201;
                    res.end('File created or updated');
                }
            });
        });
    } else if (method === 'OPTIONS') {
        const newFileName = req.headers['x-new-file-name'];

        if (!newFileName) {
            res.statusCode = 400;
            res.end('Bad Request: Missing X-New-File-Name header');
            return;
        }

        const newFilePath = path.join(options.directory, newFileName);

        logToFile(options.logFile, `Request: ${method} ${reqUrl} - Old file: ${filePath} - New file: ${newFilePath} - Date: ${moment().format("DD.MM.YYYY, HH:mm")}`);

        fs.rename(filePath, newFilePath, (err) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal Server Error');
            } else {
                res.statusCode = 200;
                res.end('File renamed');
            }
        });
    } else {
        res.statusCode = 405;
        res.end('Method Not Allowed');
    }
});


server.listen(options.port, options.address, () => {
    console.log(`Server running at http://${options.address}:${options.port}/`);
});