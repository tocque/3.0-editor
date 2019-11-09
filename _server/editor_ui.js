/*  
    editor_ui.js ui组件类
    只存放基类, 单实例的类放在view中 
*/
import {utils} from "./editor_util.js"
import {listen} from "./editor_listen.js";

export class control {

    node;

    /** 控件的基类, 每个实例与一个数据节点相绑定 */
    constructor() {

    }

    // 载入数据节点
    loadNode(node) {
        this.node = node;
    }
}

export class navbar {

    tabs = {};
    /** 
     * 导航栏的基类
     * @param {HTMLElement} body 导航栏主体
     * @param {Array} tabelms 标签页数组
     * @param {String} chosen 初始标签名, 当该标签被绑定时, 自动选择
     */
    constructor(body, tabelms, chosen) {
        this.body = body;
        for (let elm of tabelms) {
            this.tabs[elm.dataset.tab] = {
                elm: elm,
                active: null,
                unactive: null,
            };
        }

        this.chosen = chosen;
        listen.proxyEvent(this.body, "click", this.judge, this.switch.bind(this));
    }

    // 将标签和模块绑定
    bind(tab, active, unactive) {
        this.tabs[tab].active = active;
        this.tabs[tab].unactive = unactive;
        if (tab == this.chosen) this.chose(tab);
    }

    judge(elm) {
        return utils.isset(elm.dataset.tab);
    }

    switch(elm) {
        let tab = elm.dataset.tab;
        if (tab == this.chosen) return;
        if (this.chosen) {
            this.unchose(this.chosen);
        }
        this.chose(tab);
        this.chosen = tab;
    }

    chose(id) {
        this.tabs[id].elm.classList.add("chosen");
        if (this.tabs[id].active) this.tabs[id].active();
    }
    
    unchose(id) {
        this.tabs[id].elm.classList.remove("chosen");
        if (this.tabs[id].unactive) this.tabs[id].unactive();
    }
}

export class layer {

}

export class toastNotify {

    /**
     * 右下弹框提示, 关闭后实例就会销毁
     * @param {String} type 提示的类型, 有
     * @param {String} content 提示内容, 可以是HTML
     * @param {Array} buttons 按钮组, 从左至右排列
     */
    constructor(type, content, buttons) {
        this.body = document.createElement("div");
        this.body.classList.add("toastNotify");
        this.body.setAttribute("role", "alert");
        this.body.innerHTML = this.createDOM(type, content);
        listen.proxyEvent(this.body, "click", (elm) => {
            return elm.getAttritube("role") == "button"; 
        }, this.click.bind(this));
    }

    createDOM(type, content) {
        return /* HTML */`<i class="codicon codicon-${type}"></i>
            <i class="codicon codicon-${type}"></i>
            <div class="body">Default SmallPop</div>`;
    }

    pop() {

    }

    close() {
        this.body.remove();
    }
}

export class contextMenu {
    /**
     * 右键菜单的类
     * @param {Array}}items 菜单内容 格式为[{
     *     "text": 显示的项目名, 若不填则为分割线
     *     "shortcut", 
     *     "action": 点击时进行的操作
     * }],
     */
    constructor(obj, items) {
        this.body = document.createElement("div");
        this.body.setAttribute("class", "contextMenu");
        this.actionList = [];
        let menuFrame = document.createElement("ul");
        for (let item of items) {
            if (!item.text) menuFrame.innerHTML += "<hr/>";
            else {
                this.actionList.push(item.action);
                menuFrame.innerHTML += /* HTML */`<li 
                    class="item"
                    data-index=${this.actionList.length}>
                    <span class="text">${item.text}</span>
                    <span class="shortcut">${item.shortcut}</span>
                </li>`;
            }
        }
        this.body.addEventListener(this.onclick.bind(this));
        document.body.appendChild(this.body);
        obj.oncontextmenu = this.oncontext.bind(this);
    }

    onclick(e) {
        let li = editor.listen.hasPass(e, function(elm) {
            return elm.classList.contain("item");
        });
        if (li) this.actionList[li.dataset.index]();
    }
    
    oncontext(e) {
        e.preventDefault();
        this.show();
    }
    
    show(e) {
        console.log(e);
        if (contextMenu.prototype.current != null) {
            this.hide.bind(contextMenu.prototype.current);
        }
        contextMenu.prototype.current = this;
        this.body.classList.add("active");
        this.body.style.left = e.target.clientX;
        this.body.style.top = e.target.clientY;
    }
    
    // 关闭当前的
    hide() {
        contextMenu.prototype.current = null;
        this.body.classList.remove("active");
    }
}