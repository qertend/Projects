const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const ws = require('nodejs-websocket');

//change to qertend.ddns.net
const hostname = '192.168.1.2';
const port = 3000;

let clients = new Set();

const server = http.createServer((req, res) => {
    console.log('Request for ' + req.url + ' by method ' + req.method);
    if (req.method == 'GET') {
        let fileUrl;
        if (req.url == '/') fileUrl = '/menu.html';
        else fileUrl = url.parse(req.url).pathname;
        let filePath = path.resolve('./public' + fileUrl);
        const fileExt = path.extname(filePath);
        if (fileExt == '.html') {
            fs.exists(filePath, (exists) => {
                if (!exists) {
                    filePath = path.resolve('./public/404.html');
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    fs.createReadStream(filePath).pipe(res);
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                fs.createReadStream(filePath).pipe(res);
            });
        }
        else if (fileExt == '.css') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css');
            fs.createReadStream(filePath).pipe(res);
        }
        else if (fileExt == '.js') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/javasctipt');
            fs.createReadStream(filePath).pipe(res);
        }
        else if (req.url == '/favicon.ico') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/x-icon');
            fs.createReadStream(path.resolve('./assets' + fileUrl)).pipe(res);
        }
        else {
            console.log("404 request not found", req.url);
            filePath = path.resolve('./public/404.html');
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            fs.createReadStream(filePath).pipe(res);
        }
    }
    else {
        filePath = path.resolve('./public/404.html');
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream(filePath).pipe(res);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

const webserver = ws.createServer(function (conn) {
        console.log("New connection")
        conn.on("text", function (str) {
            console.log("Received "+str)
            conn.sendText(str.toUpperCase()+"!!!")
        })
        conn.on("close", function (code, reason) {
            console.log("Connection closed")
        })
    }).listen(8001)
