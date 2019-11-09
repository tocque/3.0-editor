/**
 * editor_view.js 控制编辑器主体外观显示的类
 * 大部分为单例
 */
import * as ui from "./editor_ui.js";

export var topbar = new class topbar {

    /**顶部导航栏 */
    constructor() {
        let nav = document.getElementById("topnav");
        this.nav = new ui.navbar(nav, nav.getElementsByTagName("li"), "map");

        this.title = document.getElementById("title");
    }

    updateTitle(title) {
        document.title = this.title.innerText = title + " - HTML5 魔塔";
    }
};

class infoBlock {
    constructor(content) {
        this.elm = document.createElement("li");
        this.content = content;
    }

    show() {
        this.elm.classList.add("active");
    }

    hide() {
        this.elm.classList.remove("active");
    }

    update(...args) {
        this.elm.innerHTML = this.content(...args);
    }
}

export var infobar = new class infobar {
    /**
     * 底部信息栏 左侧信息栏为系统信息，右侧信息栏为面板/编辑器级信息
     */
    constructor() {
        this.body = document.getElementById("infoBar");
        this.left = document.getElementById("infoLeft");
        this.tip = new infoBlock;
        this.left.append(this.tip.elm);
    
        let rights = document.getElementsByClassName("infoRight");
        
        this.rights = {
            'system': rights[2],
            'panel': rights[1],
            'editor': rights[0],
        }
    }
    
    showTip(tip, warn) {
        if (tip) this.tip.setContent(tip);
        this.setWarning(warn);
    }
    
    applyBlock(level, content) {
        var block = new infoBlock(content);
        this.rights[level].appendChild(block.elm);
        return block;
    }
    
    warning() {
        if (code == 'warn') {
            this.body.classList.add("warning");
        }
        this.body.classList.remove("warning");
    }
}

export class panel {
    
    name = "base";
    /** 
     * 面板的基类, 与infobar, topbar绑定
     * @param {HTMLElement} body 面板主体
     * @param {String} name 面板名称
     */
    constructor(body, name) {
        this.body = body;
        this.name = name;
        topbar.nav.bind(this.name, this.active.bind(this), this.unactive.bind(this));
    }

    active() {
        this.body.classList.add("active");
        // editor.view.infobar.changePanel(this);
    }

    unactive() {
        this.body.classList.remove("active");
        // editor.view.infobar.changePanel(null);
    }
}

export class editor {

    name = "base";
    /** 
     * 编辑器的基类
     * @param {HTMLElement} body 编辑器主体
     */
    constructor(body) {
        this.body = body;
    }

    /** 
     * 绑定到导航/切换按钮上
     * @param {ui.navbar} nav 导航类
     */
    bindTo(nav) {
        nav.bind(this.name, this.active.bind(this), this.unactive.bind(this));
    }

    active() {
        this.body.classList.add("active");
        // editor.view.infobar.changeEditor(this);
    }

    unactive() {
        this.body.classList.remove("active");
        // editor.view.infobar.changeEditor(null);
    }
}
