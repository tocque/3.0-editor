import { isset } from "../../editor_util.js";

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

export class textEditor {
    constructor() {
        const _this = this;
        this.vm = new Vue({
            el: ".blocklyWidgetDiv",
            template: /* HTML */`
            <mt-window :active.sync="active" width="60%" closeBtn @close="cancal">
                <simple-editor ref="text" lang="plaintext"></simple-editor>
                <mt-btn @click="confirm">确认</mt-btn>
            </mt-window>
            `,
            data: {
                active: false,
            },
            methods: {
                show(text) {
                    this.$refs.text.setValue(text);
                    return new Promise((res, rej) => this.res = res);
                },
                comfirm() {
                    this.res(this.$refs.text.getValue());
                },
                cancal() {
                    this.res(null);
                }
            }
        })
    }
    open(block, field) {
        const text = block.getFieldValue(field);
        this.vm.show(text).then((newText) => {
            if (isset(newText)) {
                block.setFieldValue(newText.split('\n').join('\\n'), field);
            }
        });
    }
}