"use strict";
/**
 * editor_multi.js 代码编辑器
 */
import {utils} from "./editor_util.js";
import * as ui from "./editor_ui.js";
import * as view from "./editor_view.js";

require.config({ paths: { 'vs': '_server/vs' }});
require(['vs/editor/editor.main'], function() {
    console.log(arguments);
});

export class multi extends view.editor {

    listener = {};
    editted = false;
    line = 1;
    col = 1;

    /**
     * monaco 编辑器的类
     * @param {HTMLElement} mountPoint 挂载到的元素
     * @param {Object} infoHooks 监听信息块 
     */
    constructor(mountPoint, infoHooks) {
        this.editor = monaco.editor.create(mountPoint, {
            theme: 'vs-dark',
            mouseWheelScrollSensitivity: 0.4,
            language: 'javascript'
        });
        this.editor.onDidChangeModelContent(this.onedit.bind(this));
        this.editor.onDidChangeCursorPosition(this.oncursor.bind(this));
        
        this.addListener(infoHooks);
        window.addEventListener("resize", this.editor.layout);
    }

    show() {
        this.container.classList.add("active");
    }

    loadNode(node) {
        if (this.node) {
            this.node.unchose();
        }
        node.chose();
        this.node = node;
        this.editor.setModel(node.model);
        this.updateListener("pos", this.line, this.col);
        this.updateListener("lang", "JavaScript");
    }

    save() {
        this.node.setValue(this.model.getValue());
    }

    addListener(listener) {
        this.listener = Object.assign({}, this.listener, listener);
    }

    // 判断当前状态
    isChanged() {
        return this.editor.getModel()._commandManager.past.length != 0;
    }

    onedit(e) {
        this.editted = true;
        this.updateListener("changed", this.isChanged());
    }

    oncursor(e) {
        this.line = e.position.lineNumber, this.col = e.position.column;
        this.updateListener("pos", this.line, this.col);
    }

    updateListener(prop, ...rest) {
        if (this.listener[prop]) {
            this.listener[prop](...rest);
        }
    }
}
