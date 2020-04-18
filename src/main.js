import * as ui from "./ui.js"
import * as util from "./utils.js"
import Config from "./config.js"
import game from "./game.js"
import service from "./service.js"
import * as fs from "./fs.js"
import project from "./project.js"
const { ipcRenderer } = require('electron');

const libs = {
    util, game, ui, service, Config, fs, project
};

const editor = new class Editor {
    version = "3.0 pre-alpha";
    __VERSION_CODE__ = 0;

    constructor() {
        this.afterload = this.load();
    }

    /** 加载编辑器所需的各个模块 */
    async load() {
        console.log(libs);
        for (let lib in libs) { // 仍然提供通过editor访问的方式, 但是原则上内部不使用
            this[lib] = libs[lib];
        }

        [ this.userdata ] = await Promise.all([
            new Config("./userdata.json").loaded, 
            project.init(),
            service.init()
        ]);
        
        const view = (await import('./view/index.js')).default;
        
        this.window = new Vue({
            render: h => h(view)
        }).$mount("#window");

        // 注册控制台
        this.window.$regShortcut("f12", {
            action: () => ipcRenderer.send('open-devtool')
        })
        return this;
    }
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
    const string = msg.toLowerCase();
    let source = '';
    if (string.includes("script error")) {
        msg = 'Script Error: See Browser Console for Detail';
    } else {
        if (url) url = url.substring(url.lastIndexOf('/')+1);
        source = url + 'Line :' + lineNo;
        if (error) {
            source += 'Error object: ' + JSON.stringify(error)
        }
        // alert(message);
    }
    try {
        const config = {};
        if (source) {
            config.source = source
        }
        editor.window.$notify.error(msg, { source });
    } catch (e) {
        alert(msg + '\n' + source);
    }
    return false;
};

window.editor = editor;