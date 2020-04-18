import { translateKeyCode, exec } from "../../utils.js"

const keyRules = {}

export default {
    install(Vue) {

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
        const regShortcut = function(keyCode, shortcut) {
            if (!shortcut) {
                for (let name in keyCode) {
                    regShortcut(name, keyCode[name]);
                }
            } else {
                let spec = "";
                if (typeof keyCode == "number") {
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
                if (shortcut instanceof Function) shortcut = { action: shortcut }
                if (!shortcut.pirority) shortcut.pirority = 0;
                if (!keyRules[spec]) keyRules[spec] = [];
                if (!keyRules[spec][keyCode]) keyRules[spec][keyCode] = [shortcut];
                else {
                    keyRules[spec][keyCode].push(shortcut);
                    keyRules[spec][keyCode].sort((a, b) => b.pirority - a.pirority);
                }
            }
        }
    
        const execShortcut = function(e) {
            console.log(e);
            let spec = "";
            if (e.altKey) spec += "alt";
            if (e.ctrlKey) spec += "ctrl";
            if (e.shiftKey) spec += "shift";
            if (!spec) spec = "normal";
            if (!keyRules[spec]) return;
            const shortcuts = keyRules[spec][e.keyCode];
            if (!shortcuts) return;
            let prevent = false;
            for (let shortcut of shortcuts) {
                if (exec(shortcut.condition) != false) {
                    shortcut.action();
                    if (shortcut.prevent) prevent = true;
                }
            }
            if (prevent) e.preventDefault();
        }

        document.body.addEventListener('keydown', execShortcut);

        Vue.prototype.$regShortcut = regShortcut;
    }
}
