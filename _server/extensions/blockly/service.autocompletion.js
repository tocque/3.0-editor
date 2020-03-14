/**
 * @file service.autocompletion.js 提供自动补全的插件
 */
import game from "../../editor_game.js"

/**
 * 判断a是否是b的前缀
 * @param {String} a
 * @param {String} b
 * @returns {Boolean}
 */
const isPrefix = function(a, b) {
    return a != b && b.startsWith(a);
}
/** 提供 status:xxx，item:xxx和flag:xxx的补全 */
const getValueCompletions = function(content) {
    const index = Math.max(content.lastIndexOf(":"), content.lastIndexOf("："));
    if (index < 0) return;
    const ch = content.charAt(index);
    const before = content.substring(0, index), token = content.substring(index+1);
    if (!(/^[a-zA-Z0-9_\u4E00-\u9FCC]*$/.test(token))) return;
    if (before.endsWith("状态") || (ch == ':' && before.endsWith("status"))) {
        let list = Object.keys(game.core.status.hero);
        if (before.endsWith("状态") && MotaActionFunctions) {
            list = MotaActionFunctions.pattern.replaceStatusList
                .map((v) => v[1])
                .concat(list);
        }
        return list.filter((one) => isPrefix(token, one)).sort();
    }
    else if (before.endsWith("物品") || (ch == ':' && before.endsWith("item"))) {
        let list = Object.keys(game.core.material.items);
        if (before.endsWith("物品") && MotaActionFunctions) {
            list = MotaActionFunctions.pattern.replaceItemList
                .map((v) => v[1])
                .concat(list);
        }
        return list.filter((one) => isPrefix(token, one)).sort();
    }
    else if (before.endsWith("变量") || (ch == ':' && before.endsWith("flag"))) {
        return Object.keys(game.used_flags || {})
            .filter((one) => isPrefix(token, one))
            .sort();
    }
}

/**
 * core.xxx的补全
 * @param {String} content 
 */
const getFunctionCompletions = function(content) {
    const index = content.lastIndexOf("core.");
    if (index < 0) return;
    const s = content.substring(index + 5);
    if (/^[\w.]*$/.test(s)) {
        const tokens = s.split("."), prefix = tokens[tokens.length - 1];
        let now = game.core;
        for (let i = 0; i < tokens.length - 1; ++i) {
            now = now[tokens[i]];
            if (now == null) break;
        }
        if (now != null) {
            const candidates = [];
            for (let i in now) {
                candidates.push(i);
            }
            return candidates.filter((one) => isPrefix(prefix, one)).sort();
        }
    }
}

 /**
  * 
  * @param {String} content 当前框中输入内容
  * @returns {Array} 后续所有可补全内容
  */
const getAutoCompletions = function(content) {

    return getValueCompletions(content)
        || getFunctionCompletions(content)
        || [];
}

/**@type {Array<String>} */let completeItems = [];

const inject = function(quietInput) {
    Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
    const div = Blockly.WidgetDiv.DIV;
    // Create the input.
    const htmlInput =
        goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlInput');
    htmlInput.setAttribute('spellcheck', this.spellcheck_);
    const fontSize =
        (Blockly.FieldTextInput.FONTSIZE * this.workspace_.scale) + 'pt';
    div.style.fontSize = fontSize;
    htmlInput.style.fontSize = fontSize;

    Blockly.FieldTextInput.htmlInput_ = htmlInput;
    div.appendChild(htmlInput);

    htmlInput.value = htmlInput.defaultValue = this.text_;
    htmlInput.oldValue_ = null;

    // console.log('here')
    const self = this;
    var pb=self.sourceBlock_
    var args = MotaActionBlocks[pb.type].args
    var targetf=args[args.indexOf(self.name)+1]

    // ------ colour

    if(targetf && targetf.slice(0,7)==='Colour_') {
        const inputDom = htmlInput;
        // var getValue=function(){ // 获得自己的字符串
        //     return pb.getFieldValue(self.name);
        // }
        const setValue = function(newValue) { // 设置右边颜色块的css颜色
            pb.setFieldValue(newValue, targetf)
        }
        // 给inputDom绑事件
        inputDom.oninput = function() {
            const value = inputDom.value
            if (/[0-9 ]+,[0-9 ]+,[0-9 ]+(,[0-9. ]+)?/.test(value)) {
                setValue('rgba('+value+')')
            }
        }
    }
    else {

        htmlInput.onkeydown = function (e) {
            if (e.keyCode == 13 && awesomplete.opened && awesomplete.selected) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                e.preventDefault();
                awesomplete.select();
                return false;
            }
        }

        // --- awesomplete
        const awesomplete = new Awesomplete(htmlInput, {
            minChars: 2,
            maxItems: 12,
            autoFirst: true,
            replace: function (text) {
                text = text.toString();
                const value = this.input.value;
                let index = this.input.selectionEnd ?? value.length;
                if (index < awesomplete.prefix.length) index = awesomplete.prefix.length;
                const str = value.substring(0, index - awesomplete.prefix.length) + text + value.substring(index);
                this.input.value = str;
                pb.setFieldValue(str, self.name);
                index += text.length - awesomplete.prefix.length;
                this.input.setSelectionRange(index, index);

                completeItems = completeItems.filter((x) => x != text);
                ecompleteItems.unshift(text);
            },
            filter: function () { return true; },
            item: function (text, input) {
                const li = document.createElement("li");
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", "false");
                input = awesomplete.prefix.trim();
                if (input != "") text = text.replace(new RegExp("^"+input, "i"), "<mark>$&</mark>");
                li.innerHTML = text;
                return li;
            },
            sort: function (a, b) {
                a = a.toString(); b = b.toString();
                let ia = completeItems.indexOf(a), ib = completeItems.indexOf(b);
                if (ia < 0) ia = completeItems.length;
                if (ib < 0) ib = completeItems.length;
                if (ia != ib) return ia - ib;
                if (a.length != b.length) return a.length - b.length;
                return a < b ? -1 : 1;
            }
        });

        htmlInput.oninput = function () {
            const index = htmlInput.selectionEnd ?? htmlInput.value.length;
            const value = htmlInput.value.substring(0, index);
            // cal prefix
            awesomplete.prefix = "";
            for (let i = index - 1; i>=0; i--) {
                const c = value.charAt(i);
                if (!(/^[a-zA-Z0-9_\u4E00-\u9FCC]$/.test(c))) {
                    awesomplete.prefix = value.substring(i+1);
                    break;
                }
            }

            const list = getAutoCompletions(value);
            awesomplete.list = list;
            awesomplete.ul.style.marginLeft = getCaretCoordinates(htmlInput, htmlInput.selectionStart).left -
                htmlInput.scrollLeft - 20 + "px";
            awesomplete.evaluate();
        }

        awesomplete.container.style.width = "100%";

        window.awesomplete = awesomplete;
    }

    if (!quietInput) {
        htmlInput.focus();
        htmlInput.select();
    }
    this.validate_();
    this.resizeEditor_();

    this.bindEvents_(htmlInput);
};

export const init = function() {
    Blockly.FieldTextInput.prototype.showInlineEditor_ = inject;
}