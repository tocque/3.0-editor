(function () {
    fs = {};


    var _isset = function (val) {
        if (val == undefined || val == null || (typeof val=='number' && isNaN(val))) {
            return false;
        }
        return true
    }

    var _http = function (type, url, formData, success, error, mimeType, responseType) {
        var xhr = new XMLHttpRequest();
        xhr.open(type, url, true);
        if (_isset(mimeType))
            xhr.overrideMimeType(mimeType);
        if (_isset(responseType))
            xhr.responseType = responseType;
        xhr.onload = function(e) {
            if (xhr.status==200) {
                if (_isset(success)) {
                    success(xhr.response);
                }
            }
            else {
                if (_isset(error))
                    error("HTTP "+xhr.status);
            }
        };
        xhr.onabort = function () {
            if (_isset(error))
                error("Abort");
        }
        xhr.ontimeout = function() {
            if (_isset(error))
                error("Timeout");
        }
        xhr.onerror = function() {
            if (_isset(error))
                error("Error on Connection");
        }
        if (_isset(formData))
            xhr.send(formData);
        else xhr.send();
    }


    var postsomething = function (data, _ip, callback) {
        if (typeof(data) == typeof([][0]) || data == null) data = JSON.stringify({1: 2});

        _http("POST", _ip, data, function (data) {
            if (data.slice(0, 6) == 'error:') {
                callback(data, null);
            }
            else {
                callback(null, data);
            }
        }, function (e) {
            console.log(e);
            callback(e+"：请检查启动服务是否处于正常运行状态。");
        }, "text/plain; charset=x-user-defined");
    }

    fs.readFile = function (filename, encoding, callback) {
        if (typeof(filename) != typeof(''))
            throw 'Type Error in fs.readFile';
        if (encoding == 'utf-8') {
            //读文本文件
            //filename:支持"/"做分隔符
            //callback:function(err, data)
            //data:字符串
            var data = '';
            data += 'type=utf8&';
            data += 'name=' + filename;
            postsomething(data, '/readFile', callback);
            return;
        }
        if (encoding == 'base64') {
            //读二进制文件
            //filename:支持"/"做分隔符
            //callback:function(err, data)
            //data:base64字符串
            var data = '';
            data += 'type=base64&';
            data += 'name=' + filename;
            postsomething(data, '/readFile', callback);
            return;
        }
        throw 'Type Error in fs.readFile';
    }

    fs.writeFile = function (filename, datastr, encoding, callback) {
        if (typeof(filename) != typeof('') || typeof(datastr) != typeof(''))
            throw 'Type Error in fs.writeFile';
        if (encoding == 'utf-8') {
            //写文本文件
            //filename:支持"/"做分隔符
            //callback:function(err)
            //datastr:字符串
            var data = '';
            data += 'type=utf8&';
            data += 'name=' + filename;
            data += '&value=' + datastr;
            postsomething(data, '/writeFile', callback);
            return;
        }
        if (encoding == 'base64') {
            //写二进制文件
            //filename:支持"/"做分隔符
            //callback:function(err)
            //datastr:base64字符串
            var data = '';
            data += 'type=base64&';
            data += 'name=' + filename;
            data += '&value=' + datastr;
            postsomething(data, '/writeFile', callback);
            return;
        }
        throw 'Type Error in fs.writeFile';
    }

    fs.writeMultiFiles = function (filenames, datastrs, callback) {
        postsomething('name='+filenames.join(';')+'&value='+datastrs.join(';'), '/writeMultiFiles', callback);
    }

    fs.readdir = function (path, callback) {
        //callback:function(err, data)
        //path:支持"/"做分隔符,不以"/"结尾
        //data:[filename1,filename2,..] filename是字符串,只包含文件不包含目录
        if (typeof(path) != typeof(''))
            throw 'Type Error in fs.readdir';
        var data = '';
        data += 'name=' + path;
        postsomething(data, '/listFile', function (err, data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                err = "Invalid /listFile";
                data = null;
            }
            callback(err, data);
        });
        return;
    }

    /** 读取文本文件 */
    fs.fetch = function(src) {
        if (typeof(src) !== typeof('')) throw 'Type Error in fs.readFile';
        const data = 'type=base64&name=' + src;
        return new Promise((res, rej) => {
            postsomething(data, '/readFile', (err, data) => {
                if (err) rej(err)
                else res(editor.util.decode64(data));
            })
        });
    }

    /** 读取二进制文件 */
    fs.fetchBinary = function(src) {
        if (typeof(src) !== typeof('')) throw 'Type Error in fs.readFile';
        const data = 'type=base64&name=' + src;
        return new Promise((res, rej) => {
            postsomething(data, '/readFile', (err, data) => {
                if (err) rej(err)
                else res(data);
            })
        });
    }

    const fileInput = document.createElement("input");
    fileInput.style.opacity = 0;
    fileInput.type = 'file';
    fileInput.onchange = function () {
        const files = fileInput.files;
        if (files.length == 0) {
            if (errorCallback)
                errorCallback();
            return;
        }
        if (!readType) fileReader.readAsText(files[0]);
        else fileReader.readAsDataURL(files[0]);
        fileInput.value = '';
    }

    fs.selectFile = function (success, error, accept, readType) {
    
        if (window.jsinterface) {
            window.jsinterface.readFile();
            return;
        }
    
        // step 0: 不为http/https，直接不支持
        if (!window.isOnline) {
            alert("离线状态下不支持文件读取！");
            if (error) error();
            return;
        }
    
        // Step 1: 如果不支持FileReader，直接不支持
        if (fileReader == null) {
            alert("当前浏览器不支持FileReader！");
            if (error) error();
            return;
        }

        fileInput.accept = accept || "";
        readType = readType;
    
        fileInput.click();
    }
})();