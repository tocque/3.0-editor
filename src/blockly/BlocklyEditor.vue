<template>
    <mt-window class="blocklyEditor" :class="{ show: active }" 
        :active.sync="active" closeBtn mask @close="close"
    >
        <template slot="title">
            <h3 class="title">事件编辑器</h3>
            <div class="button-group">
                <mt-btn mini @click="confirm">确定</mt-btn>
                <mt-btn mini @click="parse">解析</mt-btn>
                <mt-search 
                    placeholder="搜索图块"
                    @focus="reopenToolbox(-1)"
                    @input="reopenToolbox"
                    v-model="searchKeyword"
                ></mt-search>
                <mt-btn mini @click="selectPoint">地图选点</mt-btn>
                <mt-btn mini @click="searchFlag">变量搜索</mt-btn>
                <label style="margin: 0 5px;">中文名替换</label>
                <mt-switch v-model="disableReplace"></mt-switch>
            </div>
        </template>
        <div ref="blocklyArea" class="blocklyArea"></div>
        <simple-editor ref="json" lang="json"></simple-editor>
    </mt-window>
</template>

<script>
import blocklyHook from "./blockly_proxy.js";
import serviceManager from "../service.js";

export default {
    template: /* HTML */`
    `,
    data() {
        return {
            entryType: '', // 入口类型
            disableReplace: false,
            active: false,
            searchKeyword: "",
            lastUsedType: [],
            lastUsedTypeNum: 15,
        }
    },
    async created() {
        this.blockly = blocklyHook;
        this.disableReplace = MotaActionFunctions.disableReplace;
    },
    async mounted() {
        this.$nextTick(() => {
            this.workspace = this.blockly.inject(this.$refs.blocklyArea, this);
        })
        this.active = false;
        this.widgets = {};
        this.blocklyWidgetDiv = document.getElementsByClassName("blocklyWidgetDiv");
        serviceManager.receiveExtensions("blockly.widget", (name, widget) => {
            this.widgets[name] = widget;
            widget.init();
        });
    },
    methods: {
        /** 解析json */
        parse() {
            this.workspace.clear();
            const xml = MotaActionFunctions.parse(this.$refs.json.getValue(), this.entryType);
            Blockly.Xml.domToWorkspace(xml, this.workspace);
        },
    
        /**
         * 载入数据节点
         * @param {String} text 事件
         * @param {String} type 入口类型
         * @returns {Promise} 编辑结果, 若为null代表未编辑
         */
        async import(text, type) {
            await this.show();
            this.text = text;
            this.$refs.json.setValue(this.text);
            this.entryType = type;
            this.parse();
            return new Promise(res => { this.res = res });
        },
    
        async show() {
            this.active = true;
            return new Promise(res => {
                this.$nextTick(() => {
                    this.workspace._resize();
                    res();
                })
            }) 
        },
    
        hide() {
            this.active = false;
        },
    
        close(value) {
            this.res(value);
            this.text = null;
            this.hide();
        },

        error(e) {
            this.$print(e);
        },

        setJson(json) {
            this.text = json;
            this.$refs.json.setValue(json);
        },
    
        confirm() {
            if (!this.text) return;
            if (!this.checkEntry()) return;
            if (this.text === '') {
                this.close(this.entryType === 'shop' ? '[]' : 'null');
                return;
            }
            let code = Blockly.JavaScript.workspaceToCode(this.workspace);
            code = code.replace(/\\(i|c|d|e)/g, '\\\\$1');
            const obj = (new Function("return " + code))();
            if (this.checkAsync(obj) && confirm("警告！存在不等待执行完毕的事件但却没有用【等待所有异步事件处理完毕】来等待" +
                "它们执行完毕，这样可能会导致录像检测系统出问题。\n你要返回修改么？")) return;
            this.close(JSON.stringify(obj));
        },

        onUseBlock(blockId) {
            const block = this.workspace.getBlockById(blockId);
            this.addIntoLastUsedType(block);
        },

        onDoubleClickBlock(blockId) {
            const block = this.workspace.getBlockById(blockId);
            for (let widget of Object.values(this.widgets)) {
                let param;
                if (window.condition instanceof Function) {
                    param = widget.condition(block);
                } else param = widget.condition[block.type] || false;
                if (param == false) continue;
                widget.open(block, param);
            }
        },

        /** 检查入口方块 */
        checkEntry() {
            if(this.workspace.topBlocks_.length >= 2) {
                this.error('入口方块只能有一个');
                return false;
            } else if (this.workspace.topBlocks_.length == 1) {
                const blockType = this.workspace.topBlocks_[0].type;
                if(blockType !== this.entryType+'_m') {
                    this.error('入口方块类型错误');
                    return false;
                }
            }
            return true;
        },
    
        // 检查"不等待处理完毕"
        checkAsync(obj) {
            if (!(obj instanceof Array)) return false;
            var hasAsync = false;
            for (let one of obj) {
                if (one.type == 'if' && (this.checkAsync(one['true']) || this.checkAsync(one['false'])))
                    return true;
                if ((one.type == 'while' || one.type == 'dowhile') && this.checkAsync(one.data))
                    return true;
                if (one.type == 'if' && (this.checkAsync(one.yes) || this.checkAsync(one.no)))
                    return true;
                if (one.type == 'choices') {
                    const list = one.choices;
                    if (list instanceof Array) {
                        for (let action of list) {
                            if (this.checkAsync(action)) return true;
                        }
                    }
                }
                if (one.type == 'switch') {
                    const list = one.caseList;
                    if (list instanceof Array) {
                        for (let action of list) {
                            if (this.checkAsync(action)) return true;
                        }
                    }
                }
                if (one.async && one.type != 'animate') hasAsync = true;
                if (one.type == 'waitAsync') hasAsync = false;
            }
            return hasAsync;
        },
    
        addIntoLastUsedType(b) {
            if(!b) return;
            const blockType = b.type;
            if(!blockType || blockType.indexOf("_s")!==blockType.length-2 || blockType==='pass_s')return;
            this.lastUsedType = this.lastUsedType.filter(v => v !== blockType);
            if (this.lastUsedType.length >= this.lastUsedTypeNum)
                this.lastUsedType.pop();
            this.lastUsedType.unshift(blockType);
    
            this.searchKeyword = '';
        },
    
        // Index from 1 - 9
        openToolbox(index) {
            if (index < 0) index += this.workspace.toolbox_.tree_.children_.length;
            this.workspace.toolbox_.tree_.setSelectedItem(this.workspace.toolbox_.tree_.children_[index]);
        },
    
        reopenToolbox(index) {
            if (index < 0) index += this.workspace.toolbox_.tree_.children_.length;
            this.workspace.toolbox_.tree_.setSelectedItem(this.workspace.toolbox_.tree_.children_[index]);
            this.workspace.getFlyout_().show(this.workspace.toolbox_.tree_.children_[index].blocks);
        },
    
        closeToolbox() {
            this.workspace.toolbox_.clearSelection();
        },
    
        searchBlock(value) {
            if (value == null) value = this.searchKeyword;
            value = value.toLowerCase();
            if (value == '') return this.lastUsedType;
            const results = [];
            for (let name in MotaActionBlocks) {
                if (typeof name !== 'string' || name.indexOf("_s") !== name.length-2) continue;
                const block = MotaActionBlocks[name];
                if(block && block.json) {
                    if ((block.json.type||"").toLowerCase().indexOf(value)>=0
                        || (block.json.message0||"").toLowerCase().indexOf(value)>=0
                        || (block.json.tooltip||"").toLowerCase().indexOf(value)>=0) {
                        results.push(name);
                        if (results.length>=this.lastUsedTypeNum)
                            break;
                    }
                }
            }
            return results.length == 0 ? this.lastUsedType : results;
        },

        searchFlag() {

        },

        selectPoint() {

        },

        showXML() {
            const xml = Blockly.Xml.workspaceToDom(this.workspace);
            console.log(Blockly.Xml.domToPrettyText(xml));
            console.log(Blockly.Xml.domToText(xml));
            console.log(xml);
        }
    },
    watch: {
        disableReplace(value) {
            editor.userdata.set("disableBlocklyReplace", value);
            if (MotaActionFunctions) MotaActionFunctions.disableReplace = value;
            this.$notify("已" + (value ? "开启" : "关闭") + "中文变量名替换！\n关闭并重开事件编辑器以生效。");
        }
    }
}
</script>

<style lang="less">
.blocklyEditor {
    position: absolute;
    background: var(--c-main);
    width: 96%;
    height: 92%;
    top: 4%;
    left: 2%;
    z-index: -1;
    &.show {
        z-index: 30;
    }
    .mt-window__title {
        display: flex;
        align-items: center;
        justify-content: start;
        background: var(--c-left);
        .button-group {
            color: var(--c-text);
            display: flex;
            align-items: center;
            li {
                padding: 5px 10px;
            }
        }
        .mt-window__control {
            margin-left: auto;
            &:hover {
                background-color: var(--c-close);
                color: var(--c-text-hl);
            }
            i.mt-icon {
                display: inline-block;
                line-height: 30px;
                height: 100%;
                width: 46px;
                font-size: 16px;
            }
        }
    }
    .title {
        color: var(--c-header);
        margin: 0 10px;
        white-space: nowrap;
    }
    &.show .widget {
        z-index: 201;
    }
    .blocklyArea, .simple-editor {
        position: absolute;
        top: 40px;
        bottom: 0;
    }
    .blocklyArea {
        left: 0;
        right: 45%;
    }
    .simple-editor {
        left: 55%;
        right: 0;
        height: auto;
    }
    .blocklyToolboxDiv {
        color: #1E1E1E;
    }
}
</style>