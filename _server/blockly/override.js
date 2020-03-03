/**
 * override.js 对Blockly内部实现的复写
 */
Blockly.Generator.prototype.scrub_ = function(_block, code) {
    console.log(code);
    // Optionally override
    return code;
};

Blockly.FieldColour.prototype.createWidget_ = function() {
    Blockly.WidgetDiv.hide();

    // console.log('here')
    const self=this;
    var pb = self.sourceBlock_
    var args = MotaActionBlocks[pb.type].args
    var targetf=args[args.indexOf(self.name)-1]

    var getValue=function(){
        // return self.getValue() // css颜色
        var f = pb.getFieldValue(targetf);
        if (/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(,0(\.\d+)?|,1)?$/.test(f)) {
            return f;
        }
        return "";
        // 也可以用 pb.getFieldValue(targetf) 获得颜色块左边的域的内容
    }

    var setValue=function(newValue){ // css颜色
        self.setValue(newValue)
        var c=new Colors();
        c.setColor(newValue)
        var rgbatext = [c.colors.webSmart.r,c.colors.webSmart.g,c.colors.webSmart.b,c.colors.alpha].join(",");
        pb.setFieldValue(rgbatext, targetf) // 放在颜色块左边的域中
    }

    setTimeout(function () {
        document.getElementById("colorPicker").value = getValue();
        window.jsColorPicker.confirm = setValue;
        // 设置位置
        triggerColorPicker(Blockly.WidgetDiv.DIV.style.left, Blockly.WidgetDiv.DIV.style.top);
    });

    return document.createElement('table');
};

const getAutoCompletions = function(content) {
    // --- content为当前框中输入内容；将返回一个列表，为后续所有可补全内容

    // 检查 status:xxx，item:xxx和flag:xxx
    const index = Math.max(content.lastIndexOf(":"), content.lastIndexOf("："));
    if (index >= 0) {
        const ch = content.charAt(index);
        const before = content.substring(0, index), token = content.substring(index+1);
        if (/^[a-zA-Z0-9_\u4E00-\u9FCC]*$/.test(token)) {
            if (before.endsWith("状态") || (ch == ':' && before.endsWith("status"))) {
                var list = Object.keys(core.status.hero);
                if (before.endsWith("状态") && MotaActionFunctions) {
                    list = MotaActionFunctions.pattern.replaceStatusList.map((v) => {
                        return v[1];
                    }).concat(list);
                }
                return list.filter((one) => one != token && one.startsWith(token)).sort();
            }
            else if (before.endsWith("物品") || (ch == ':' && before.endsWith("item"))) {
                var list = Object.keys(core.material.items);
                if (before.endsWith("物品") && MotaActionFunctions) {
                    list = MotaActionFunctions.pattern.replaceItemList.map(function (v) {
                        return v[1];
                    }).concat(list);
                }
                return list.filter(function (one) {
                    return one != token && one.startsWith(token);
                }).sort();
            }
            else if (before.endsWith("变量") || (ch == ':' && before.endsWith("flag"))) {
                return Object.keys(editor.used_flags || {}).filter(function (one) {
                    return one != token && one.startsWith(token);
                }).sort();
            }
        }
    }

    // 提供 core.xxx 的补全
    index = content.lastIndexOf("core.");
    if (index >= 0) {
        var s = content.substring(index + 5);
        if (/^[\w.]*$/.test(s)) {
            var tokens = s.split(".");
            var now = core, prefix = tokens[tokens.length - 1];
            for (var i = 0; i < tokens.length - 1; ++i) {
                now = now[tokens[i]];
                if (now == null) break;
            }
            if (now != null) {
                var candidates = [];
                for (var i in now) {
                    candidates.push(i);
                }
                return candidates.filter((one) => {
                    return one != prefix && one.startsWith(prefix);
                }).sort();
            }
        }
    }

    return [];
}

Blockly.FieldTextInput.prototype.showInlineEditor_ = function(quietInput) {
    Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
    var div = Blockly.WidgetDiv.DIV;
    // Create the input.
    var htmlInput =
        goog.dom.createDom(goog.dom.TagName.INPUT, 'blocklyHtmlInput');
    htmlInput.setAttribute('spellcheck', this.spellcheck_);
    var fontSize =
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

    if(targetf && targetf.slice(0,7)==='Colour_'){
        var inputDom = htmlInput;
        // var getValue=function(){ // 获得自己的字符串
        //     return pb.getFieldValue(self.name);
        // }
        var setValue = function(newValue){ // 设置右边颜色块的css颜色
            pb.setFieldValue(newValue, targetf)
        }
        // 给inputDom绑事件
        inputDom.oninput=function(){
            var value=inputDom.value
            if(/[0-9 ]+,[0-9 ]+,[0-9 ]+(,[0-9. ]+)?/.test(value)){
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
        var awesomplete = new Awesomplete(htmlInput, {
            minChars: 2,
            maxItems: 12,
            autoFirst: true,
            replace: function (text) {
                text = text.toString();
                var value = this.input.value, index = this.input.selectionEnd;
                if (index == null) index = value.length;
                if (index < awesomplete.prefix.length) index = awesomplete.prefix.length;
                var str = value.substring(0, index - awesomplete.prefix.length) + text + value.substring(index);
                this.input.value = str;
                pb.setFieldValue(str, self.name);
                index += text.length - awesomplete.prefix.length;
                this.input.setSelectionRange(index, index);

                editor_blockly.completeItems = editor_blockly.completeItems.filter(function (x) {
                    return x != text;
                });
                editor_blockly.completeItems.unshift(text);
            },
            filter: function () {return true;},
            item: function (text, input) {
                var li = document.createElement("li");
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", "false");
                input = awesomplete.prefix.trim();
                if (input != "") text = text.replace(new RegExp("^"+input, "i"), "<mark>$&</mark>");
                li.innerHTML = text;
                return li;
            },
            sort: function (a, b) {
                a = a.toString(); b = b.toString();
                var ia = editor_blockly.completeItems.indexOf(a), ib = editor_blockly.completeItems.indexOf(b);
                if (ia < 0) ia = editor_blockly.completeItems.length;
                if (ib < 0) ib = editor_blockly.completeItems.length;
                if (ia != ib) return ia - ib;
                if (a.length != b.length) return a.length - b.length;
                return a < b ? -1 : 1;
            }
        });

        htmlInput.oninput = function () {
            var value = htmlInput.value, index = htmlInput.selectionEnd;
            if (index == null) index = value.length;
            value = value.substring(0, index);
            // cal prefix
            awesomplete.prefix = "";
            for (var i = index - 1; i>=0; i--) {
                var c = value.charAt(i);
                if (!/^[a-zA-Z0-9_\u4E00-\u9FCC]$/.test(c)) {
                    awesomplete.prefix = value.substring(i+1);
                    break;
                }
            }

            var list = editor_blockly.getAutoCompletions(value);
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