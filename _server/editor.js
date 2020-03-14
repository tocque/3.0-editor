import * as ui from "./editor_ui.js"
import * as util from "./editor_util.js"
import * as file from "./editor_file.js"
import game from "./editor_game.js"
import listen from "./editor_listen.js"
import service from "./editor_service.js"

const libs = {
    util, game, ui, listen, service, file
};

class editor {
    version = "3.0 pre-alpha";
    __VERSION_CODE__ = 0;

    /** vue监听字段 */proJectName = '';

    constructor() {
        this.fs = fs;
        this.afterload = this.load();
    }

    /** 加载编辑器所需的各个模块 */
    async load() {
        console.log(libs);
        for (let lib in libs) { // 仍然提供通过editor访问的方式, 但是原则上内部不使用
            if (libs.hasOwnProperty(lib)) {
                this[lib] = libs[lib];
            }
        }

        [
            this.userdata, this.extensions, this.towerInfo, this.gameInfo
        ] = await Promise.all([
            new file.Config("./_server/userdata.json"), 
            new file.Config("./_server/extensions.json"),
            new file.Config("./work.h5mota"),
            new file.Config("./_server/game/gameInfo.json"),
        ]);
        await Promise.all[
            game.load(), 
            service.loadExtensions(this.extensions.get("mainEditor", {}))
        ];
        this.window = await import('./editor_window.js');
        await game.hooks.initOver;
        this.window = this.window.default();
        return this;
    };
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

window.editor = new editor();