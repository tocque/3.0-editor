/**
 * @file blockly_proxy.js Blockly编辑器类
 */

import { mountJs, exec, isset } from "../utils.js";
import serviceManager from "../service.js";

 /** blockly钩子, 当blockly模块加载完毕时resolve */
export default new class BlocklyProxy {

    async load() {
        try {
            const loader = [
                fetch('./blockly/MotaAction.g4').then(res => res.text()),
                import('./block_config.js'),
                import('./Converter.bundle.min.js'),
                import('./parser.js'),
                new Promise(res => { // 等待blockly组件加载完毕
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
            if (Array.isArray(value)) continue;
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
            media: 'blockly/media/',
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
        workspace._resize = onresize;

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
            const xmlList = [];
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
};
