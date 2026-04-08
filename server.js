const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const port = 8086;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Proxy for API
  if (req.url.startsWith('/api/')) {
    const targetUrl = 'http://wanfu9999.com/get_price.php' + req.url.substring(4);
    http.get(targetUrl, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    }).on('error', (err) => {
      res.writeHead(500);
      res.end('Error: ' + err.message);
    });
    return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(port);

console.log(`Server running at http://localhost:${port}/`);
