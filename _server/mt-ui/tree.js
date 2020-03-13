let __wrongMark__ = false;

const controllers = {
    "checkbox": { tag: "mt-switch" },
    "const": { tag: "span", class: "const", nomodel: true },
    "select": { 
        tag: "select", 
        child: /* HTML */`
        <option v-for="(option, i) of options" :key="i" :value="option"
        >{{ option }}</option>`
    },
    "color": { tag: "el-color-picker", attr: { ":show-alpha": "comment._alpha"} },
    "text": { tag: "input", attr: { "type": "text" } },
    "number": { tag: "input", attr: { "type": "number" } },
    "event": { 
        tag: "mt-btn", 
        child: `{{ value ? '编辑' : '添加' }}`, 
        attr: { "mini": "", "@click": "editEvent" },
        nomodel: true,
        methods: {
            editEvent() {
                const text = this.value ? JSON.stringify(this.value) : '';
                this.openBlockly(text, this.comment._event).then((e) => {
                    console.log(e);
                })
            }
        }
    },
    "table": {
        tag: "mt-table",
        attr: { ":comment": "comment" }
    }
}

const parseNode = function(type, { tag, child, nomodel, attr, class:cls }) {
    if (attr) {
        attr = Object.entries(attr).map(([k, v]) => `${k}="${v}"`).join(' ');
    } else attr = '';
    return `<${tag} v-if="comment._type=='${type}'" class="${cls || ''}" 
        ${attr} ${nomodel ? '':'v-model="value"'}>${child || ''}</${tag}>`;
}

const { template, methods } = Object.entries(controllers)
    .reduce(({ template, methods }, [type, config]) => {
        template.push(parseNode(type, config));
        if (config.methods) {
            methods = Object.assign({}, methods, config.methods);
        }
        return { template, methods };
    }, { template: [], methods: {} });

const controlNode = {
    template: /* HTML */`
    <div class="control-node" :title="comment._data+data.field">
        <span class="comment">{{ comment._name }}</span>
        <div class="control-input">
            ${ template.join('') }
        </div>
    </div>`,
    inject: ["openBlockly"],
    props: ["node", "data"],
    data: function() {
        return {
            comment: '',
            value: '',
        }
    },
    created: function() {
        this.comment = this.data.comment;
        this.value = this.data.data;
        if (this.comment._type == 'color' && this.value) {
            this.value = this.value.join(',');
        }
        if (this.comment._type == 'select') {
            if (this.comment._options instanceof Function) {
                this.options = this.comment._options();
            } else this.options = this.comment._options;
        }
    },
    methods: {
        onchange: function () {
            editor_mode.onmode(this.$parent.mode);
            var thiseval = null;
            try {
                if (value == '') value = 'null';
                thiseval = JSON.parse(value);
            } catch (ee) {
                printe(field + ' : ' + ee);
                throw ee;
            }
            if (this.checkRange(this.node.cobj, thiseval)) {
                editor_mode.addAction(['change', this.node.field, thiseval]);
                editor_mode.onmode('save');//自动保存 删掉此行的话点保存按钮才会保存
            } else {
                printe(field + ' : 输入的值不合要求,请鼠标放置在注释上查看说明');
            }
        },
        /**
         * 检查一个值是否允许被设置为当前输入
         * @param {Object} cobj 
         * @param {*} thiseval 
         */
        checkRange: function (cobj, thiseval) {
            if (cobj._options) {
                return cobj._options.values.indexOf(thiseval) !== -1;
            }
            if (cobj._bool) {
                return [true, false].indexOf(thiseval) !== -1;
            }
            if (cobj._range) {
                return cobj._range(thiseval);
            }
            return true;
        },
        ...methods
    }
};

/**
 * 注释对象的默认值
 */
let defaultcobj = {
    // 默认是文本域
    _type: 'textarea',
    _data: '',
    _string: function (args) {//object~[field,cfield,vobj,cobj]
        var thiseval = args.vobj;
        return (typeof (thiseval) === typeof ('')) && thiseval[0] === '"';
    },
    // 默认情况下 非对象和数组的视为叶节点
    _leaf: function (args) {//object~[field,cfield,vobj,cobj]
        var thiseval = args.vobj;
        if (thiseval == null || thiseval == undefined) return true;//null,undefined
        if (typeof (thiseval) === typeof ('')) return true;//字符串
        if (Object.keys(thiseval).length === 0) return true;//数字,true,false,空数组,空对象
        return false;
    },
}

/**
 * 把来自数据文件的obj和来自*.comment.js的commentObj组装成表格
 * commentObj在无视['_data']的意义下与obj同形
 * 即: commentObj['_data']['a']['_data']['b'] 与 obj['a']['b'] 是对应的
 *     在此意义下, 两者的结构是一致的
 *     在commentObj没有被定义的obj的分支, 会取defaultcobj作为默认值
 * 因此在深度优先遍历时,维护 
 *     field="['a']['b']"
 *     cfield="['_data']['a']['_data']['b']"
 *     vobj=obj['a']['b']
 *     cobj=commentObj['_data']['a']['_data']['b']
 * @param {Object} data 数据 
 * @param {Object} comment 注释文件
 * @returns {Object} 对象树根节点
 */
export const buildTree = function(data, comment) {
    let root = { field: "", data, comment }
    /**
     * cobj = Object.assign({}, defaultcobj, pcobj['_data'][ii])
     * 每一项若未定义,就从defaultcobj中取
     * 当其是函数不是具体值时,把args = {
     *     field: field, cfield: cfield, vobj: vobj, cobj: cobj
     * } 代入算出该值
     * @param {*} parent 父结点
     * @param {*} pcomment 父结点注释域标记的子节点
     * @param {*} cfield 节点数据域
     * @param {String} key 节点属性名
     */
    const createNode = function(parent, pcomment, cfield, key) {
        let node = {
            field: parent.field + `[${key}]`,
            data: parent.data[key],
            key
        }
        let comment = null;
        if (pcomment) {
            // cobj存在时直接取
            if (pcomment[key]) comment = pcomment[key];
            // 当其为函数时代入参数算出cobj,
            else if (pcomment instanceof Function) comment = pcomment(key);
            // 不存在时只取defaultcobj
        }
        node.comment = Object.assign({}, defaultcobj, comment);
        const args = {
            field: node.field, cfield: cfield, vobj: node.data, cobj: node.comment
        }
        // 当cobj的参数为函数时,代入args算出值
        for (let key in node.comment) {
            if (key === '_data') continue;
            if (node.comment[key] instanceof Function) {
                node.comment[key] = node.comment[key](args, data);
            }
        }
        node.data = args.vobj;
        return node;
    }    
    /**
     * 深度优先遍历
     * @param {{field: String, data: Object, comment: Object}} parent 父结点 
     * @param {String} pcfield 父结点的注释域
     */
    const recursionParse = function (parent, pcfield) {
        parent.children = [];
        let keysInOrder = {};
        const voidMark = {};
        const cchildren = parent.comment?.['_data'];
        // 1. 按照pcobj排序生成
        for (let ii in cchildren) {
            keysInOrder[ii] = voidMark;
        }
        // 2. 对每个pvobj且不在pcobj的，再添加到最后
        keysInOrder = Object.assign({}, keysInOrder, parent.data)
        for (let key in keysInOrder) {
            // 3. 对于pcobj有但是pvobj中没有的, 弹出提示, (正常情况下editor_file会补全成null)
            //    事实上能执行到这一步工程没崩掉打不开,就继续吧..
            if (keysInOrder[key] === voidMark) {
                if (!__wrongMark__) {
                    const msg = `comment和data不匹配, 请在群 HTML5造塔技术交流群 959329661 内反馈, 失配数据域: ${parent.field}['${key}']`
                    editor.window.$notify.error(msg, {
                        source: "control_list.js"
                    })
                    __wrongMark__ = true;
                }
                parent.data[key] = null;
            }
            const cfield = pcfield + `['_data']['${key}']`;
            const node = createNode(parent, cchildren, cfield, key)
            parent.data[key] = node.data;
            // 标记为_hide的属性不展示
            if (node.comment._hide) continue;
            parent.children.push(node);
            // 不是叶节点时, 插入展开的标记并继续遍历, 此处可以改成按钮用来添加新项或折叠等
            if (!node.comment._leaf) recursionParse(node, cfield);
        }
    }
    // 开始遍历
    recursionParse(root, "");
    return root;
};

Vue.component("control-list", {
    template: /* HTML */`
    <div class="container control-list">
        <el-tree :data="tree"
            :basePadding="10" ref="tree"
        >
            <control-node 
                slot-scope="{ node, data }" :node="node" :data="data"
            ></control-node>
        </el-tree>
    </div>`,
    props: ["comment"],
    data: function() {
        return {
            commentObj: {},
            tree: [],
        }
    },
    async created() {
        this.afterLoad = 'on';
        if (typeof this.comment == 'string') {
            if (this.comment != '') {
                this.commentObj = await this.loadComment(this.comment);
            }
        } else this.commentObj = this.comment;
        if (this.afterLoad != 'on') this.update(this.afterLoad);
        else this.afterLoad = 'off'
    },
    methods: {
        async loadComment(comment) {
            if (typeof comment === typeof('')) {
                return (await import('../comments/'+comment+'.comment.js')).default;
            } else {
                return comment;
            }
        },
        buildTree,
        /**
         * 双击表格时
         *     正常编辑: 尝试用事件编辑器或多行文本编辑器打开
         *     添加: 在该项的同一级创建一个内容为null新的项, 刷新后生效并可以继续编辑
         *     删除: 删除该项, 刷新后生效
         * 在点击按钮 添加/删除 后,下一次双击将被视为 添加/删除
         */
        operate: function (guid, obj, commentObj, thisTr, input, field, cobj, modeNode) {
            if (editor_mode.doubleClickMode === 'change') {
                if (cobj._type === 'event') editor_blockly.import(guid, { type: cobj._event });
                if (cobj._type === 'textarea') editor_multi.import(guid, { lint: cobj._lint, string: cobj._string });
            } else if (editor_mode.doubleClickMode === 'add') {
                editor_mode.doubleClickMode = 'change';
                editor.table.addfunc(guid, obj, commentObj, thisTr, input, field, cobj, modeNode)
            } else if (editor_mode.doubleClickMode === 'delete') {
                editor_mode.doubleClickMode = 'change';
                editor.table.deletefunc(guid, obj, commentObj, thisTr, input, field, cobj, modeNode)
            }
        },
        
        changeDoubleClickModeByButton(mode) {
            ({
                delete: function () {
                    printf('下一次双击表格的项删除，切换下拉菜单可取消；编辑后需刷新浏览器生效。');
                    this.doubleClickMode = mode;
                },
                add: function () {
                    printf('下一次双击表格的项则在同级添加新项，切换下拉菜单可取消；编辑后需刷新浏览器生效。');
                    this.doubleClickMode = mode;
                }
            }[mode])();
        },

        update(data, comment) {
            if (comment && this.commentObj != comment) {
                this.commentObj = comment;
            }
            if (this.afterLoad == 'on') {
                this.afterLoad = data;
                return;
            }
            this.tree = this.buildTree(data, this.commentObj).children;
        }
    },
    components: {
        controlNode
    }
});

let editor_table = function () {
}

/////////////////////////////////////////////////////////////////////////////
// HTML模板

editor_table.prototype.select = function (value, values) {
    let content = editor.table.option(value) +
        values.map(function (v) {
            return editor.table.option(v)
        }).join('')
    return /* html */`<select>\n${content}</select>\n`
}
editor_table.prototype.option = function (value) {
    return /* html */`<option value='${JSON.stringify(value)}'>${JSON.stringify(value)}</option>\n`
}
editor_table.prototype.text = function (value) {
    return /* html */`<input type='text' spellcheck='false' value='${JSON.stringify(value)}'/>\n`
}
editor_table.prototype.checkbox = function (value) {
    return /* html */`<input type='checkbox' ${(value ? 'checked ' : '')}/>\n`
}
editor_table.prototype.textarea = function (value, indent) {
    return /* html */`<textarea spellcheck='false'>${JSON.stringify(value, null, indent || 0)}</textarea>\n`
}

editor_table.prototype.title = function () {
    return /* html */`\n<tr><td>条目</td><td>注释</td><td>值</td><td>操作</td></tr>\n`
}

editor_table.prototype.gap = function (field) {
    return /* html */`<tr><td>----</td><td>----</td><td>${field}</td><td>----</td></tr>\n`
}


/////////////////////////////////////////////////////////////////////////////
// 表格的用户交互

/**
 * 当"编辑表格内容"被按下时
 */
editor_table.prototype.onEditBtnClick = function (button) {
    var tr = button.parentNode.parentNode;
    var guid = tr.getAttribute('id');
    var cobj = JSON.parse(tr.children[1].getAttribute('cobj'));
    if (cobj._type === 'event') editor_blockly.import(guid, { type: cobj._event });
    if (cobj._type === 'textarea') editor_multi.import(guid, { lint: cobj._lint, string: cobj._string });
}

/**
 * 删除表格项
 */
editor_table.prototype.deletefunc = function (guid, obj, commentObj, thisTr, input, field, cobj, modeNode) {
    editor_mode.onmode(editor_mode.rids[modeNode.getAttribute('id')]);
    if (editor.table.checkRange(cobj, null)) {
        editor_mode.addAction(['delete', field, undefined]);
        editor_mode.onmode('save');//自动保存 删掉此行的话点保存按钮才会保存
    } else {
        printe(field + ' : 该值不允许为null，无法删除');
    }
}

/**
 * 添加表格项
 */
editor_table.prototype.addfunc = function (guid, obj, commentObj, thisTr, input, field, cobj, modeNode) {
    editor_mode.onmode(editor_mode.rids[modeNode.getAttribute('id')]);

    var mode = editor.dom.editModeSelect.value;

    // 1.输入id
    var newid = '2';
    if (mode == 'loc') {
        var ae = editor.currentFloorData.autoEvent[editor_mode.pos.x + ',' + editor_mode.pos.y];
        if (ae != null) {
            var testid;
            for (testid = 2; Object.hasOwnProperty.call(ae, testid); testid++); // 从3开始是因为comment中设置了始终显示012
            newid = testid + '';
        }
    } else {
        newid = prompt('请输入新项的ID（仅公共事件支持中文ID）');
        if (newid == null || newid.length == 0) {
            return;
        }
    }

    // 检查commentEvents
    if (mode !== 'commonevent') {
        // 2.检查id是否符合规范或与已有id重复
        if (!/^[a-zA-Z0-9_]+$/.test(newid)) {
            printe('id不符合规范, 请使用大小写字母数字下划线来构成');
            return;
        }
    }

    var conflict = true;
    var basefield = field.replace(/\[[^\[]*\]$/, '');
    if (basefield === "['main']") {
        printe("全塔属性 ~ ['main'] 不允许添加新值");
        return;
    }
    try {
        var baseobj = eval('obj' + basefield);
        conflict = newid in baseobj;
    } catch (ee) {
        // 理论上这里不会发生错误
        printe(ee);
        throw ee;
    }
    if (conflict) {
        printe('id已存在, 请直接修改该项的值');
        return;
    }
    // 3.添加 
    editor_mode.addAction(['add', basefield + "['" + newid + "']", null]);
    editor_mode.onmode('save');//自动保存 删掉此行的话点保存按钮才会保存
}

Vue.component('workspace-item', {
    template: /* HTML */`
    <span class="workspace-item">
        <i v-if="node.isLeaf || gapIcon" 
            class="codicon" :class="'codicon-'+(node.isLeaf ? icon : gapIcon)"
        ></i>
        <slot></slot>
        <i v-show="data.unsave" class="codicon codicon-circle-filled"></i>
    </span>
    `,
    props: ["node", "data", "icon", "gapIcon"],
})