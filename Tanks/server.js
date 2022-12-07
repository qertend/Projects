const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const ws = require('nodejs-websocket');

//change to qertend.ddns.net
const hostname = 'localhost';
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
                //send cookie to identify host client [not tested]
                if (fileUrl == '/host.html') {
                    console.log("host.html");
                    res.setHeader('Set-Cookie', ['id=client1111']);
                }
                if (fileUrl == '/join.html') {

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
        else if (fileUrl == '/favicon.ico') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/x-icon');
            fs.createReadStream(path.resolve('./assets/' + fileUrl)).pipe(res);
        }
        else if (fileExt == '.png') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/png');
            fs.createReadStream(path.resolve(filePath)).pipe(res);
        }
        else if (fileExt == '.svg') {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/svg+xml');
            fs.createReadStream(path.resolve(filePath)).pipe(res);
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

const webserver = ws.createServer(function (conn) {
    //new client    
    console.log("New connection");
    //send data at 100Hz
    conn.interval = setInterval(() => {
        //change {type: "pos", p1Bacward: false} to non-static value
        conn.sendText(JSON.stringify({type: "pos", p1Bacward: false}));
    }, 10);
    clients.add(conn);
    conn.on("text", function (msg) {
        data = JSON.parse(msg);
        console.log("Received: '"+data.msg + "'");
        conn.sendText(data.msg.toUpperCase()+"!!!");
    });
    conn.on("close", function (code, reason) {
        clearInterval(conn.interval);
        clients.delete(conn);
        console.log("Connection closed");
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

webserver.listen(3001);
