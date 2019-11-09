/**
 * view_scriptpanel.js 脚本编辑界面
 */
import {utils} from "./editor_util.js";
import * as ui from "./editor_ui.js";
import {multi} from "./ui_multi.js";
import * as view from "./editor_view.js";

export var scriptPanel = new class scriptPanel extends view.panel {

    constructor() {
        this.list = document.getElementById("scriptList"),
        this.scriptMulti = document.getElementById("scriptMulti");
        this.currentModel = null;
        var fmap = {};
        var fjson = JSON.stringify(functions_d6ad677b_427a_4623_b50f_a445a3b0ef8a, function (k, v) {
            if (v instanceof Function) {
                var id_ = editor.util.guid();
                fmap[id_] = v.toString();
                return id_;
            } else return v
        }, 4);
        var fobj = JSON.parse(fjson);
        editor.file.functionsMap = fmap;
        editor.file.functionsJSON = fjson;
        this.scriptList = new editor.list(
            document.getElementById("scriptList"),
            editor.file.functionsComment,
            function() {
                var locObj = JSON.parse(editor.file.functionsJSON);
                editor.util.buildlocobj(locObj, editor.file.functionsMap);
                return locObj;
            },
            this.onclick.bind(this),
        );
        this.scriptList.update();
        editor.ui.regShortcut({

        });
        this.scriptMulti.addEventListener("keydown");
        this.editorInfoBlocks = {
            pos: editor.infoBar.applyBlock("editor", function(ln, col) {
                return `<span>Ln ${ln}, Col ${col}</span>`;
            }),
            lang: editor.infoBar.applyBlock("editor", function(lang) {
                return `<span>${lang}</span>`;
            }),
        }
        this.editorInfoHooks = {};
        for (let m in this.editorInfoBlocks) {
            this.editorInfoHooks[m] = this.editorInfoBlocks[m].update.bind(this.editorInfoBlocks[m]);
        }
    }

    active() {
        for (let m in this.editorInfoBlocks) {
            this.editorInfoBlocks[m].show();
        }
    }

    unactive() {
        for (let m in this.editorInfoBlocks) {
            this.editorInfoBlocks[m].hide();
        }
    }

    onclick(e, elm) {
        if (elm.dataset.type == "script") {
            this.switchModel(elm._listnode);
        }
    }

    switchModel(node) {
        if (!node.model) {
            if (this.currentModel && !this.currentModel.model) {
                // 直接复用当前模型
                node.applyModel(this.currentModel);
                return;
            }
            else {
                node.applyModel();
            }
        }
        if (this.currentModel == node.model) return;
        node.editor.show();
        this.currentModel = node.model;
    }
}
