/**
 * editor_blockly.js Blockly编辑器类
 */

import { mountJs, exec, isset } from "./editor_util.js";
import { importCSS } from "./editor_ui.js";
import serviceManager from "./editor_service.js";

 /** blockly钩子, 当blockly模块加载完毕时resolve */
const blocklyHook = (new class BlocklyProxy {

    async load() {
        try {
            const loader = [
                fetch('./_server/blockly/MotaAction.g4').then(res => res.text()),
                import('./blockly/block_config.js'),
                import('./blockly/Converter.bundle.min.js'),
                import('./blockly/parser.js'),
                new Promise((res, rej) => { // 等待blockly组件加载完毕
                    if ((Blockly||{}).__ready__) res();
                    else document.getElementById('blocklyLang').onload = res;
                })
            ];
            const [motaAction, config, cv, parser] = await Promise.all(loader);
            this.config = config;
            window.MotaActionFunctions = parser.MotaActionFunctions;// 向全局暴露, 属于遗留问题
            MotaActionFunctions.disableReplace = !editor.userdata.get("disableBlocklyReplace", false);

            const converter = new cv.Converter().init();
            converter.generBlocks(motaAction);
            converter.renderGrammerName();
            const mainFile = converter.blocks + converter.OmitedError;
            mountJs(mainFile);

            this.blocksIniter(MotaActionBlocks);
            this.blocks = this.config.blockList(this.parser);
            serviceManager.receiveExtensions("blockly.service", (name, service) => {
                service.init();
            });
        } catch(e) {
            // 此时window可能未mount
            console.error(e);
            alert("图块描述文件加载失败, 请在'启动服务.exe'中打开编辑器, 错误信息"+e);
        }
        return this;
    }
    
    //把各方块的信息注册到Blockly中
    blocksIniter(blocksobj) {
        for(let key in blocksobj) {
            const value = blocksobj[key];
            if (value instanceof Array) continue;
            Blockly.Blocks[key] = {
                init: function() { this.jsonInit(value.json); }
            }
            Blockly.JavaScript[key] = value.generFunc;
        }
    }

    /**
     * 将blockly注入到DOM上
     * @param {HTMLElement} mountElm blockly的挂载点
     * @param {Vue} vm 对应的vue实例
     * 为了接收对应信息 vm需要声明一些属性和方法
     * +    error方法: 报错, 
     * +    onUseBlock, onDoubleClickBlock方法: 响应用户操作
     * +    getJson方法: 获得解析出的json
     * +    entryType属性: 入口块类别,
     */
    inject(mountElm, vm) {
        const blocklyDiv = document.createElement('div');
        mountElm.appendChild(blocklyDiv);
        blocklyDiv.classList.add("blocklyDiv");
        const toolbox = this.createToolbox(this.blocks);
        const workspace = Blockly.inject(blocklyDiv, {
            media: '_server/blockly/media/',
            toolbox,
            zoom: {
                controls: true,
                wheel: false, // 滚轮改为上下(shift:左右)翻滚
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.08
            },
            trashcan: false,
        });
        this.setListener(workspace, { mountElm, blocklyDiv, vm });
        this.overrideMotaActionFunctions();
        return workspace; 
    }

    /**
     * 从block块列表生成工具栏
     * @param blockList block块列表 
     * @returns {toolbox: HTMLElement} 
     */
    createToolbox(blockList) {
        const toolboxgap = '<sep gap="5"></sep>'
        const toolbox = document.createElement('xml');

        blockList['最近使用事件'] = ['<label text="占位符"></label>']; // 最近使用事件
        for (let name in blockList) {
            const category = document.createElement('category');
            category.setAttribute('name', name);
            category.innerHTML = blockList[name].join(toolboxgap);
            toolbox.appendChild(category);
        }
        toolbox.lastChild.setAttribute('custom', "searchBlockCategory");
        return toolbox;
    }
    
    /**
     * 设置侦听器
     * @param {Blockly.WorkspaceSvg} workspace 生成的工作区
     * @param {{mountElm: HTMLElement, blocklyDiv: HTMLElement, vm: Vue}  
     */
    setListener(workspace, {mountElm, blocklyDiv, vm}) {
        const onresize = function(e) {
            blocklyDiv.style.width = mountElm.offsetWidth + 'px';
            blocklyDiv.style.height = mountElm.offsetHeight + 'px';
            Blockly.svgResize(workspace);
        };
        if(!editor.isMobile) {
            window.addEventListener('resize', onresize, false);
        }
        onresize();

        blocklyDiv.onmousewheel = function(e) {
            //console.log(e);
            e.preventDefault();
            const hvScroll = e.shiftKey?'hScroll':'vScroll';
            const mousewheelOffsetValue = 20/380*workspace.scrollbar[hvScroll].handleLength_*3;
            workspace.scrollbar[hvScroll].handlePosition_ += ( 
                ((e.deltaY||0)+(e.detail||0)) > 0 ? mousewheelOffsetValue
                    : -mousewheelOffsetValue
            );
            workspace.scrollbar[hvScroll].onScroll_();
            workspace.setScale(workspace.scale);
        }

        let doubleClickCheck = [[0,'abc']];
        function omitedcheckUpdateFunction(event) {
            if(event.type === 'create') {
                vm.onUseBlock(event.blockId);
            }
            if(event.type === 'ui') {
                if (event.element == "theme") return;
                const newClick = [new Date().getTime(), event.blockId];
                const lastClick = doubleClickCheck.shift();
                doubleClickCheck.push(newClick);
                if(newClick[0]-lastClick[0]<500 && newClick[1]===lastClick[1]) {
                    vm.onDoubleClickBlock(newClick[1]);
                }
            }
            if (!vm.checkEntry()) return;
            try {
                let code = Blockly.JavaScript.workspaceToCode(workspace);
                code = code.replace(/\\\\(i|c|d|e)/g, '\\\\\\\\$1');
                vm.setJson(code);
                vm.error("");
            } catch (error) {
                vm.error(String(error));
                if (error instanceof OmitedError){
                    const blockName = error.blockName;
                    const varName = error.varName;
                    const block = error.block;
                }
                // console.log(error);
            }
        }
        function searchBlockCategoryCallback(workspace) {
            var xmlList = [];
            const labels = vm.searchBlock();
            for (let label of labels) {
                const blockText = `<xml>${MotaActionBlocks[label].xmlText()}</xml>`;
                const block = Blockly.Xml.textToDom(blockText).firstChild;
                block.setAttribute("gap", 5);
                xmlList.push(block);
            }
            console.log(xmlList);
            return xmlList;
        }

        workspace.registerToolboxCategoryCallback("searchBlockCategory", searchBlockCategoryCallback);

        workspace.addChangeListener(omitedcheckUpdateFunction);
        workspace.addChangeListener(Blockly.Events.disableOrphans);
    }

    /**
     * 待重构的方法, 此处方法运行过一次后将不能正常解析块, 故目前只能Inject一次
     */
    overrideMotaActionFunctions() {
        // 因为在editor_blockly.parse里已经HTML转义过一次了,所以这里要覆盖掉以避免在注释中出现&lt;等
        MotaActionFunctions.xmlText = function (ruleName,inputs,isShadow,comment) {
            const rule = MotaActionBlocks[ruleName];
            const blocktext = isShadow?'shadow':'block';
            const xmlText = [];
            xmlText.push('<'+blocktext+' type="'+ruleName+'">');
            if(!inputs)inputs=[];
            for (let ii=0,inputType;inputType=rule.argsType[ii];ii++) {
                let input = inputs[ii];
                const noinput = (input===null || input===undefined);
                if(noinput && inputType==='field') continue;
                let _input = '';
                if(noinput) input = '';
                if(inputType!=='field') {
                    let subList = false;
                    let subrulename = rule.args[ii];
                    subrulename=subrulename.split('_').slice(0,-1).join('_');
                    let subrule = MotaActionBlocks[subrulename];
                    if (subrule instanceof Array) {
                        subrulename=subrule[subrule.length-1];
                        subrule = MotaActionBlocks[subrulename];
                        subList = true;
                    }
                    _input = subrule.xmlText([],true);
                    if(noinput && !subList && !isShadow) {
                        //无输入的默认行为是: 如果语句块的备选方块只有一个,直接代入方块
                        input = subrule.xmlText();
                    }
                }
                xmlText.push('<'+inputType+' name="'+rule.args[ii]+'">');
                xmlText.push(_input+input);
                xmlText.push('</'+inputType+'>');
            }
            if(comment){
                xmlText.push('<comment>');
                xmlText.push(comment);
                xmlText.push('</comment>');
            }
            const next = inputs[rule.args.length];
            if (next) {//next
                xmlText.push('<next>');
                xmlText.push(next);
                xmlText.push('</next>');
            }
            xmlText.push('</'+blocktext+'>');
            return xmlText.join('');
        }
    }
    
    runCode(workspace) {
        // Generate JavaScript code and run it.
        window.LoopTrap = 1000;
        Blockly.JavaScript.INFINITE_LOOP_TRAP =
            'if (--window.LoopTrap == 0) throw "Infinite loop.";\n';
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
        try {
            eval('obj=' + code);
            console.log(obj);
        } catch (e) {
            alert(e);
        }
    }
}).load();

importCSS("./_server/blockly/blockly.css");

export default {
    template: /* HTML */`
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
        this.blockly = await blocklyHook;
        this.disableReplace = MotaActionFunctions.disableReplace;
        editor.window.openBlockly = this.import;
    },
    async mounted() {
        // blockly加载时不能处于dislay: none的状态, 否则样式会变形
        const blockly = await blocklyHook;
        this.preshow();
        this.$nextTick(() => {
            this.workspace = blockly.inject(this.$refs.blocklyArea, this);
            this.active = false;
        })
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
        import(text, type) {
            this.preshow();
            this.$nextTick(() => {
                this.text = text;
                this.$refs.json.setValue(this.text);
                this.entryType = type;
                this.parse();
            })
            return new Promise((res, rej) => { this.res = res });
        },

        preshow() {
            this.$el.visibility = "hidden";
            this.active = true;
        },
    
        show() {
            this.$el.visibility = "";
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
                } else param = widget.condition[block.type] ?? false;
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
    
        previewBlock(b) {
            let types;
            if (b && types.includes(b.type)>=0) {
                try {
                    var code = "[" + Blockly.JavaScript.blockToCode(b).replace(/\\(i|c|d|e)/g, '\\\\$1') + "]";
                    eval("var obj="+code);
                    // console.log(obj);
                    if (obj.length > 0 && b.type.startsWith(obj[0].type)) {
                        let previewObj;
                        if (b.type == 'previewUI_s') previewObj = obj[0].action;
                        else previewObj = obj[0];
                        this.UIpreviewer.show(previewObj);
                    }
                } catch (e) {main.log(e);}
                return true;
            }
            return false;
        },
    
        doubleClickBlock(blockId) {
            var b = this.workspace.getBlockById(blockId);
    
            if (previewBlock(b)) return;
    
            if (b && b.type in selectPointBlocks) { // selectPoint
                this.selectPoint();
                return;
            }
    
            var f = b ? blocklyHook.textStringDict[b.type] : null;
            if (f) {
                var value = b.getFieldValue(f);
                //多行编辑
                editor_multi.multiLineEdit(value, b, f, {'lint': f === 'RawEvalString_0'}, function (newvalue, b, f) {
                    if (textStringDict[b.type] !== 'RawEvalString_0') {
                    }
                    b.setFieldValue(newvalue.split('\n').join('\\n'), f);
                });
            }
        },
    
        addIntoLastUsedType(b) {
            if(!b) return;
            var blockType = b.type;
            if(!blockType || blockType.indexOf("_s")!==blockType.length-2 || blockType==='pass_s')return;
            this.lastUsedType = this.lastUsedType.filter(function (v) {return v!==blockType;});
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
            let results = [];
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
    
        // ------ select point ------
    
        // id: [x, y, floorId, forceFloor]
        
    
        selectPoint() {
            var block = Blockly.selected, arr = null;
            var floorId = editor.currentFloorId, pos = editor.pos, x = pos.x, y = pos.y;
            if (block != null && block.type in selectPointBlocks) {
                arr = selectPointBlocks[block.type];
                var xv = parseInt(block.getFieldValue(arr[0])), yv = parseInt(block.getFieldValue(arr[1]));
                if (block.type == 'animate_s') {
                    var v = block.getFieldValue(arr[0]).split(",");
                    xv = parseInt(v[0]); yv = parseInt(v[1]);
                }
                if (!isNaN(xv)) x = xv;
                if (!isNaN(yv)) y = yv;
                if (arr[2] != null) floorId = block.getFieldValue(arr[2]) || floorId;
            }
            editor.uievent.selectPoint(floorId, x, y, arr && arr[2] == null, function (fv, xv, yv) {
                if (!arr) return;
                if (arr[2] != null) {
                    if (fv != editor.currentFloorId) block.setFieldValue(fv, arr[2]);
                    else block.setFieldValue(arr[3] ? fv : "", arr[2]);
                }
                if (block.type == 'animate_s') {
                    block.setFieldValue(xv+","+yv, arr[0]);
                }
                else {
                    block.setFieldValue(xv+"", arr[0]);
                    block.setFieldValue(yv+"", arr[1]);
                }
                if (block.type == 'changeFloor_m') {
                    block.setFieldValue("floorId", "Floor_List_0");
                    block.setFieldValue("loc", "Stair_List_0");
                }
            });
        },

        searchFlag() {

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
            editor.window.$notify("已" + (value ? "开启" : "关闭") + "中文变量名替换！\n关闭并重开事件编辑器以生效。");
        }
    }
}
