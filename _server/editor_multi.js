/**
 * @file editor_multi.js 代码编辑器
 */
import loader from "./vs/loader.js"
import { isset, decode64 } from "./editor_util.js"

import listen from "./editor_listen.js"

const require = loader.require;
require.config({ paths: { 'vs': '_server/vs' }});
const monacoLoad = new Promise((res, rej) => {
    window.define = loader.define;
    require(['vs/editor/editor.main'], res);
});

const importDefaults = async function() {
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: false
    })
    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true
    })
    let str = decode64(await fs.fetchBinary("./_server/vs/intellisence/runtime_api.ts"));
    monaco.languages.typescript.javascriptDefaults.addExtraLib(str, 'core.js')
}

monacoLoad.then(() => {
    importDefaults();
    console.log("======monacoLoad======");
})

Vue.component('code-editor', {
    template: /* HTML */`
        <div v-show="active" class="code-editor">
            <slot></slot>
            <div class="multi-container" ref="container"></div>
            <status-item v-if="nostatus != ''" v-show="active" left>
                <i class="codicon codicon-error"></i> {{ error }}
                <i class="codicon codicon-warning"></i> {{ warn }}
            </status-item>
            <status-item v-if="nostatus != ''" v-show="active">Ln {{ line }}, Col {{col}}</status-item>
            <status-item v-if="nostatus != ''" v-show="active">{{ lang }}</status-item>
        </div>
    `,
    props: {
        "lang": { default: "plaintext" }, 
        "active": { default: true },
        "text": { default: "text" },
        "nostatus": { default: false },
        "shortcut": { default: () => [] },
    },
    data() {
        return {
            line: 1,
            col: 1,
            error: 0,
            warn: 0,
        }
    },
    async created() {
        await monacoLoad;
        this.multi = monaco.editor.create(this.$refs.container, {
            theme: editor.userdata.get('monacoTheme'),
            mouseWheelScrollSensitivity: 0.6,
            language: this.lang,
            automaticLayout: true,
            tabSize: 4
        });
        this.multi.onDidChangeModelContent(this.onedit.bind(this));
        this.multi.onDidChangeCursorPosition(this.oncursor.bind(this));
        if (this.shortcut.includes("save")) {
            listen.regShortcut("s.ctrl", {
                action: this.save.bind(this),
                condition: () => this.active,
                prevent: true,
            })
        }
    },
    methods: {
        setValue(value) {
            this.multi.setValue(value);
        },
        getValue(value) {
            return this.multi.getValue(value);
        },
        load(node) {
            if (!node.model) {
                node.verison = 0;
                node.model = monaco.editor.createModel(node[this.text], this.lang)
            }
            this.node = node;
            this.multi.setModel(node.model);
        },
        checkEdit(node) {
            const editStack = node.model._commandManager;
            return editStack.currentOpenStackElement ||
                node.verison != editStack.past.length;
        },
        onedit(e) {
            let error = 0, warn = 0;
            const markers = monaco.editor.getModelMarkers();
            for (let marker of markers) {
                if (marker.severity < 2) continue;
                else if (marker.severity < 6) warn++;
                else error++;
            }
            this.error = error, this.warn = warn;
            if (this.node) this.node.editted = this.checkEdit(this.node);
        },
        oncursor(e) {
            this.line = e.position.lineNumber, this.col = e.position.column;
        },
        save() {
            if (this.node.editted) {
                this.node.verison = this.node.model._commandManager.past.length;
                this.node.editted = false;
                this.multi.pushUndoStop();
                this.node[this.text] = this.node.model.getValue();
                this.$emit('save', this.node);
            }
        }
    }
});

Vue.component('simple-editor', {
    template: /* HTML */`
    <div class="multi-container simple-editor" ref="container"></div>
    `,
    props: {
        "lang": { default: "plaintext" },
    },
    data() {
        return {
            line: 1,
            col: 1,
            error: 0,
            warn: 0,
        }
    },
    async created() {
        await monacoLoad;
        this.multi = monaco.editor.create(this.$refs.container, {
            theme: editor.userdata.get('monacoTheme'),
            mouseWheelScrollSensitivity: 0.6,
            language: this.lang,
            automaticLayout: true,
            tabSize: 4,
            minimap: { enabled: false },
            wordWrap: "on",
        });
    },
    methods: {
        setValue(value) {
            this.multi.setValue(value);
        },
        getValue(value) {
            return this.multi.getValue(value);
        },
        setLang(lang) {
            monaco.editor.setModelLanguage(this.multi.getModel(), lang);
        },
    }
});
