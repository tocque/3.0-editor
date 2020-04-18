/*
extensions.js：负责拓展插件
 */

"use strict";

function extensions() {

}

extensions.prototype._load = function (callback) {
    if (main.replayChecking || main.useCompress) return;
    if (!window.fs) {
        this._loadJs('_server/fs.js', function () {
            core.extensions._listExtensions(callback);
        }, callback);
    } else this._listExtensions(callback);
}

extensions.prototype._loadJs = function (file, callback, onerror) {
    var script = document.createElement('script');
    script.src = file + '?v=' + main.version;
    script.onload = callback;
    script.onerror = onerror;
    main.dom.body.appendChild(script);
}

extensions.prototype._listExtensions = function () {
    if (!window.fs) return;
    return new Promise((res, rej) => {
        fs.readdir('extensions', function (error, data) {
            if (error || !Array.isArray(data)) return callback();
            const list = data.filter((name) => /^[\w.-]+\.js$/.test(name)).sort();
            core.extensions._loadExtensions(list, callback);
        });
    })
}

extensions.prototype._loadExtensions = function (list, callback) {
    var i = 0;
    var load = function () {
        if (i == list.length) return callback();
        core.extensions._loadJs('extensions/' + list[i++], load, load);
    }
    load();
}
