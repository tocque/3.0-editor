/*  
    ui_list.js 控件列表类
    只存放基类, 单实例的类放在view中 
*/
import {utils} from "./editor_util.js"
import {listen} from "./editor_listen.js";
import {control} from "./editor_ui.js";


// editor_list.object = class object extends control {

//     isFold = false; // 初始默认不折叠
//     foldIcon; // 折叠标志的DOM元素

//     constructor(...args) {
//         super(...args);
//         this.foldIcon = this.dom.querySelector("i");
//     }

//     commentHTML() {
//         return /* html */`<i class="codicon codicon-chevron-down"></i>
//         <span>${this.propname}</span>\n`
//     }

//     onclick() {
//         this.setFold();
//     }

//     /** @param {Boolean} order 为true时折叠, false时不折叠, 不传入则切换折叠状态 */
//     setFold(order) {
//         if (!editor.util.isset(order)) order = !this.isFold;
//         else if (order == this.isFold) return;
//         this.foldIcon.classList.toggle("codicon-chevron-down");
//         this.foldIcon.classList.toggle("codicon-chevron-right");
//         for (let elm of this.children) {
//             elm.fold(order);
//         }
//         this.isFold = order;
//     }

//     fold(order) {
//         super.fold(order);
//         for (let elm of this.children) {
//             elm.fold(order);
//         }
//     }
// }

// editor_list.select = class select extends control {

//     controlHTML(value) {
//         let content = this.option(value) +
//             this.cobj._select.values.map(this.option.bind(this)).join('')
//         return /* html */`<select>\n${content}</select>\n`
//     }

//     option(value) {
//         return /* html */`<option value='${JSON.stringify(value)}'>${JSON.stringify(value)}</option>\n`
//     }
// }

// editor_list.number = editor_list.text = class text extends control {

//     controlHTML(value) {
//         return /* html */`<input type='text' spellcheck='false' value='${JSON.stringify(value)}'/>\n`
//     }
// }

// editor_list.em = class em extends control {

//     controlHTML(value) {
//         return /* html */`<em>${JSON.stringify(value)}</em>\n`
//     }
// }

// editor_list.checkbox = class checkbox extends control {

//     controlHTML(value) {
//         return /* html */`<div class="switch ${(value ? 'on' : '')}">
//             <em>${(value ? 'T' : 'F')}</em>
//             <i></i>
//         </div>\n`;
//     }

//     onclick(e) {
//         for (let elm of e.path) {
//             if (elm.classList.contain("switch")) {
//                 this.toggle(elm);
//                 return;
//             }
//         }
//     }

//     toggle(e) {
//         e.classList.toggle("on");
//         e.children[1].innerText = e.children[1].innerText == "T" ? "F" : "T";
//     }
// }

// editor_list.script = class script extends control {

//     editor = null;
//     editTag = null;

//     commentHTML() {
//         return /* html */`<img class="icon-f" src="_server/icon/javascript.svg"/>
//         <span class="comment">${this.commentHTMLescape}</span>
//         <span class="subcomment">${this.propname}</span>\n`
//     }

//     applyModel(node) {
//         if (node) {
//             this.editor = node;
//             this.model 
//             this.editor.loadNode(this);
//             node.editor = null;
//             this.editor.setValue(this.getValue());
//             this.editor.editted = false; // 内部使用setValue实现, 会触发onedit
//         } else this.editor = monaco.editor.createModel()
//     }

//     chose() {
//         this.dom.classList.add("chosen");
//     }

//     unchose() {
//         this.dom.classList.remove("chosen");
//     }

//     setValue(value) {
//         editor.file.functionsMap[this.vobj];
//     }

//     getValue() {
//         return editor.file.functionsMap[this.vobj];
//     }

//     update() {
//         if (editted) {
//         }
//     }
// }

// editor_list.event = editor_list.textarea = class textarea extends control {

//     controlHTML(value) {
//         return /* html */`<div class="staticIcon">
//             <img class='editEntry' src='_server/icon/${editor.util.isset(value)?'edit':'add'}Event.svg'/>
//         </div>\n`
//     }
// }

// 列表节点
class listNode {

    parent; // 父节点
    children = []; // 子节点

    dom; // 节点对应的dom元素

    foldCount = 0; // 折叠计数
    /**
     * 生成单个列表节点
     * @param {String} field 节点field列表 
     * @param {String} propname 节点属性名
     * @param {Object} vobj 节点数据对象
     * @param {Object} cobj 节点注释对象
     * @param {Object} listScope 列表作用域
     */
    constructor(field, propname, vobj, cobj, listScope) {
        this.field = field;
        this.propname = propname;
        this.vobj = vobj;
        this.cobj = cobj;
        this.listScope = listScope;

        this.depth = field.split("]").length-1;
        this.name = cobj["_name"] || "未注释项";

        let comment = String(cobj._data);
        this.commentHTMLescape = editor.util.HTMLescape(comment);

        this.dom = this.li();
        this.dom._listnode = this;
    }

    li() {
        let comment = this.commentHTML() || "",
            control = this.controlHTML(this.vobj) || "";
        return editor.util.parseDOM(/* html */`<li
            depth=${this.depth}
            data-type="${this.constructor.name}">
            ${comment}
            ${control}
        </li>\n`)[0];
    }

    commentHTML() {
        return /* html */`<span
            class="comment"
            title="${this.commentHTMLescape}\n[${this.propname}]">
        ${this.name}</span>`;
    }

    /**@abstract 控件HTML的生成函数 */
    controlHTML() {}

    /**@abstract 列表项被点击的响应函数 */
    onclick() {}

    onchange(e) {
        var thiseval = null;
        try {
            thiseval = JSON.parse(e.target.input.value);
        } catch (ee) {
            printe(this.fieldstr + ' : ' + ee);
            throw ee;
        }
        if (this.checkRange(thiseval)) {
            // editor_mode.addAction(['change', field, thiseval]);
            // editor_mode.onmode('save');//自动保存 删掉此行的话点保存按钮才会保存
        } else {
            printe(this.fieldstr + ' : 输入的值不合要求,请鼠标放置在注释上查看说明');
        }
    }

    /**
     * 检查一个值是否允许被设置为当前输入
     * @param {*} thiseval 
     */
    checkRange(thiseval) {
        if (this.cobj._range) {
            return eval(cobj._range);
        }
        return true;
    }

    /**折叠函数 @param {Boolean} order 为true时折叠, false时不折叠 */
    fold(order) {
        if (order) this.foldCount++;
        else this.foldCount--;
        if (this.foldCount == 0) {
            this.dom.classList.remove("fold");
        } else {
            this.dom.classList.add("fold");
        }
    }

    appendChild(node) {
        node.parent = this;
        this.children.push(node);
    }
}

class gap {

}

export class list {

    data = null;

    constructor(elm) {
        this.body = elm;
        this.root = null;
        listen.proxyEvent(this.body, "change", () => {
            return utils.isset(elm._listnode);
        }, this.onchange.bind(this));
        listen.proxyEvent(this.body, "click", () => {
            return utils.isset(elm._listnode);
        }, this.onclick.bind(this));
    }
    
    /////////////////////////////////////////////////////////////////////////////
    // 表格生成的控制

    /**
     * 按照数据文件生成节点
     */
    objToList(body, data) {
        this.root = new listNode(data.root, this);
        /**
         * 深度优先遍历
         * @param {listNode} parent 父节点
         */
        var _this = this;
        var recursionParse = function (parent) {
            for (var key in parent.children) {
                let node = parent.children[key];
                if (node._hide) continue;
                let listnode = new listNode(node, _this);
                parent.appendChild(listnode);
                body.appendChild(listnode.dom);
                if (!node._leaf) { // 不是叶节点时, 插入展开的标记并继续遍历
                    recursionParse(listnode, cfield);
                }
            }
        }
        recursionParse(this.root);
        return body;
    }

    load(data) {
        if (data) this.data = data;
        this.objToList(this.body, this.data);
    }

    /////////////////////////////////////////////////////////////////////////////
    // 列表的用户交互

    onchange(elm, e) {
        elm._listnode.onchange(e);
    }

    onclick(elm, e) {
        elm._listnode.onclick(e);
    }
}
