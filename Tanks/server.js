var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("hello");
    res.end();
}).listen(8080, '192.168.1.2', function() {console.log('something')});