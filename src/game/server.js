const
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    http = require('http');

export function createServer(root) {
    
    // 创建服务器:
    const server = http.createServer(function (request, response) {
        // 获得URL的path，类似 '/css/bootstrap.css':
        let pathname = url.parse(request.url).pathname;
        if (pathname == '/') pathname = "/index.html";
        // 获得对应的本地文件路径，类似 '/srv/www/css/bootstrap.css':
        const filepath = path.join(root, pathname);

        // 获取文件状态:
        fs.stat(filepath, (err, stats) => {
            if (!err && stats.isFile()) {
                // 发送200响应:
                response.writeHead(200);
                // 将文件流导向response:
                fs.createReadStream(filepath).pipe(response);
            } else {
                // 出错了或者文件不存在:
                console.log('404 ' + request.url);
                // 发送404响应:
                response.writeHead(404);
                response.end('404 Not Found');
            }
        });
    });

    let port = 1080;
    do {
        try {
            server.listen(port);
            break;
        } catch {
            port++;
        }
    } while (true);

    console.log('Server is running at http://127.0.0.1:1080/');

    return {
        server,
        port
    }
}