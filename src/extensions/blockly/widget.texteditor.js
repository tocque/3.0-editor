/**
 * @file widget.texteditor.js 文本编辑器
 */
import { isset } from "../../utils.js";
import { mountCSS } from "../../ui.js";

export const condition = {
    'text_0_s': 'EvalString_0',
    'text_1_s': 'EvalString_2',
    'autoText_s': 'EvalString_2',
    'scrollText_s': 'EvalString_0',
    'comment_s': 'EvalString_0',
    'choices_s': 'EvalString_0',
    'showTextImage_s': 'EvalString_0',
    'function_s': 'RawEvalString_0',
    'shopsub': 'EvalString_3',
    'confirm_s': 'EvalString_0',
    'drawTextContent_s': 'EvalString_0',
}

let vm;
export const init = function() {
    const mountPoint = document.createElement("div");
    document.body.appendChild(mountPoint);
    vm = new Vue({
        el: mountPoint,
        template: /* HTML */`
        <mt-window class="widget-textEditor" title="文本编辑器"
            :active.sync="active" width="60%" closeBtn @close="cancal"
        >
            <simple-editor ref="text" :lang="lang"></simple-editor>
            <div class="__foot">
                <mt-btn @click="confirm">确认</mt-btn>
            </div>
        </mt-window>
        `,
        data: {
            lang: "motadialog",
            active: false,
        },
        methods: {
            show(text) {
                this.active = true;
                this.$refs.text.setValue(text);
                return new Promise((res, rej) => this.res = res);
            },
            confirm() {
                this.active = false;
                this.res(this.$refs.text.getValue());
            },
            cancal() {
                this.active = false;
                this.res(null);
            },
            setLang(lang) {
                this.lang = lang;
            }
        }
    })
}

/**
 * 
 * @param {*} block 
 * @param {String} field 
 */
export const open = function(block, field) {
    const text = block.getFieldValue(field).split('\\n').join('\n');
    if (field.startsWith("Raw")) vm.setLang("javascript");
    else vm.setLang("motadialog");
    vm.show(text).then((newText) => {
        if (isset(newText)) {
            block.setFieldValue(newText.split('\n').join('\\n'), field);
        }
    });
}

mountCSS(/* CSS */`
    .widget-textEditor {
        top: 20%;
        padding: 2px;
    }
    .widget-textEditor .simple-editor {
        height: 240px;
    }
`);