import { translateKeyCode } from "./editor_util.js"

export default new class inputManager {
    keyRules = {}

    constructor() {
        //document.body.onmousedown = editor.uifunctions.body_click;
        document.body.addEventListener('keydown', this.execShortcut.bind(this));
    }

    getEventPath (e) {
        //console.log(e);
        let path = [];
        let currentElem = e.target;
        while (currentElem) {
            path.push(currentElem);
            currentElem = currentElem.parentElement;
        }
        if (!path.includes(window)) {
            if (!path.includes(document)) {
                path.push(document);
            }
            path.push(window);
        }
        return path;
    }

    getOffsetPos(e, elm) {
        return new editor.util.pos(e.clientX - elm.clientLeft, e.clientY - elm.clientTop);
    }

    eToLoc(e, absdom, scrdom) {
        const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        let xx = e.clientX, yy = e.clientY
        if (editor.isMobile) { xx = e.touches[0].clientX, yy = e.touches[0].clientY }
        let x = scrollLeft + xx, y = scrollTop + yy;
        if (!(absdom instanceof Array)) absdom = [dom];
        for (let i of absdom) {
            x -= i.offsetLeft;
            y -= i.offsetTop;
        }
        for (let i of scrdom) {
            x -= i.scrollLeft;
            y -= i.scrollTop;
        }
        return new editor.util.pos(x, y);
    }

    /**
     * 注册快捷键, 可以以{键盘码: 规则}的键值对形式传入
     * @param {Number|String} keyCode 监听的键盘码
     * @param {{
     *      action: Function,
     *      pirority: Number,
     *      condition: Function,
     *      prevent
     * }} shortcut 要注册的规则
     * @param shortcut.action 触发时的反应
     * @param shortcut.pirority 反应优先级, 默认为0, 数字越大越先反应
     * @param shortcut.condition 触发条件, 为true时才进行反应
     * @param shortcut.prevent 是否取消默认事件
     */
    regShortcut(keyCode, shortcut) {
        if (!shortcut) {
            for (var name in keyCode) {
                this.regShortcut(name, keyCode[name]);
            }
        } else {
            let spec = "";
            if (keyCode instanceof Number) {
                spec = "normal";
            }
            else {
                let modifier = keyCode.toLowerCase().split(".");
                keyCode = modifier.shift();
                if (modifier.includes("alt")) spec += "alt";
                if (modifier.includes("ctrl")) spec += "ctrl";
                if (modifier.includes("shift")) spec += "shift";
                if (spec === "") spec = "normal";
                try {
                    keyCode = translateKeyCode(keyCode);
                } catch(e) {
                    console.error("键盘码解析错误\n"+e);
                }
            }
            if (!shortcut.condition) shortcut.condition = condition;
            if (!shortcut.pirority) shortcut.pirority = 0;
            if (!this.keyRules[spec]) this.keyRules[spec] = [];
            if (!this.keyRules[spec][keyCode]) this.keyRules[spec][keyCode] = [shortcut];
            else {
                this.keyRules[spec][keyCode].push(shortcut);
                this.keyRules[spec][keyCode].sort((a, b) => b.pirority - a.pirority);
            }
        }
    }

    execShortcut(e) {
        let spec = "";
        if (e.altKey) spec += "alt";
        if (e.ctrlKey) spec += "ctrl";
        if (e.shiftKey) spec += "shift";
        if (!spec) spec = "normal";
        if (!this.keyRules[spec]) return;
        let shortcuts = this.keyRules[spec][e.keyCode];
        if (!shortcuts) return;
        let prevent = false;
        for (let shortcut of shortcuts) {
            if (shortcut.condition()) {
                shortcut.action();
                if (shortcut.prevent) prevent = true;
            }
        }
        if (prevent) e.preventDefault();
    }
}
