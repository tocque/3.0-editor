"use strict";
var editor = new class Editor {
    version = "3.0";

    data = {};

    /////////// 数据相关 ///////////

    /**
     * 编辑器的初始化函数
     * 激活表现层类，由表现层初始化对应的数据操作模块
     */
    init() {
        Promise.all([
            import('./editor_util.js'),
            import('./editor_view.js'),
            import('./view_mappanel.js'),
        ])
        .then(([editor_util, editor_view, view_mappanel]) => {
            editor.util = editor_util;
            editor.view = editor_view;
            editor.mappanel = view_mappanel;
            editor.game = editor_game_wrapper(editor, function() {
                editor.fs = fs;
                editor_file_wrapper(editor, function () {

                });
            });
        });
    }

    ////// 批量加载JS文件 //////
    loadJsByList(dir, loadList, callback) {
        // 加载js
        var instanceNum = 0;
        for (let i = 0; i < loadList.length; i++) {
            this.loadJs(dir, loadList[i], function () {
                instanceNum++;
                if (instanceNum === loadList.length) {
                    callback();
                }
            });
        }
    }

    ////// 加载单个JS文件 //////
    loadJs(dir, modName, callback) {
        var script = document.createElement('script');
        var name = modName;
        script.src = dir + '/' + modName + '.js';
        document.body.appendChild(script);
        script.onload = function () {
            callback(name);
        }
    }
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    var message;
    if (string.indexOf(substring) > -1){
        message = 'Script Error: See Browser Console for Detail';
    } else {
        if (url) url = url.substring(url.lastIndexOf('/')+1);
        message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');
        // alert(message);
    }
    try {
        printe(message)
    } catch (e) {
        alert(message);
    }
    return false;
};

// 兼容
var main = {
    floors: {},
    log: function (e) {
        if (e) {
            if (main.core && main.core.platform && !main.core.platform.isPC) {
                console.log((e.stack || e.toString()));
            }
            else {
                console.log(e);
            }
        }
    },
};