/**
 * @file service.colorpicker.js 提供颜色选择的插件
 */
import { mountCSS } from "../../editor_ui.js";

const inject = function() {
    Blockly.WidgetDiv.hide();

    // console.log('here')
    const self = this;
    const pb = self.sourceBlock_
    const args = MotaActionBlocks[pb.type].args
    const targetf = args[args.indexOf(self.name)-1]

    const getValue = function(){
        // return self.getValue() // css颜色
        var f = pb.getFieldValue(targetf);
        if (/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(,0(\.\d+)?|,1)?$/.test(f)) {
            return f;
        }
        return "";
        // 也可以用 pb.getFieldValue(targetf) 获得颜色块左边的域的内容
    }

    const setValue = function(newValue){ // css颜色
        self.setValue(newValue)
        const c = new Colors();
        c.setColor(newValue)
        const rgbatext = [c.colors.webSmart.r,c.colors.webSmart.g,c.colors.webSmart.b,c.colors.alpha].join(",");
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

mountCSS(/* CSS */`
    #colorPanel {
        position: fixed;
        width: max-content;
        height: 205px;
        z-index: 240;
        padding: 4px 6px;
        margin-top: 6px;
        background-color: #F5F5F5;
        box-sizing: border-box;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .14), 0 3px 1px -2px rgba(0, 0, 0, .2), 0 1px 5px 0 rgba(0, 0, 0, .12);
    }

    #colorPicker {
        margin: 2px 0; 
        border-radius: 3px;
        width: 104px;
    }
`);

export const init = function() {
    const div = document.createElement('div');
    div.innerHTML = /* HTML */`
    <div id="colorPanel" class="cpPanel" style="display: none">
        <input class="color" id="colorPicker" value="255,215,0,1"/>
        <button onclick="confirmColor()">确定</button>
    </div>`
    document.body.appendChild(div);
    // Added
    window.jsColorPicker('input.color', {
        customBG: '#222',
        readOnly: false,
        // patch: false,
        init: function(elm, colors) { // colors is a different instance (not connected to colorPicker)
            elm.style.backgroundColor = elm.value;
            elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
        },
        appendTo: document.getElementById("colorPanel"),
        size: 1,
    });

    Blockly.FieldColour.prototype.createWidget_ = inject;
}