var editor_file_wrapper = function (editor, callback) {

const commentList = [
    'comment',
    'data.comment',
    'functions.comment',
    'events.comment',
    'plugins.comment',
];

editor.file = new class editor_file {

    constructor(callback) {
        this.loadCommentjs(commentList, function() {
            callback();
        });
    }
    
    loadCommentjs = function (commentList, callback) {
        let promiseList = [];
        for (let name of commentList) {
            promiseList.push(import("./table/"+ name + ".js"));
        }
        Promise.all(promiseList)
            .then((loadList) => {
                for (let i = 0; i < loadList.length; i++) {
                    let key = commentList[i].replace(/\.(\w)/g, (w, c) => {
                        return c.toUpperCase(c)
                    });
                    let objname = commentList[i].replace(/\./g, '_') + '_c456ea59_6018_45ef_8bcc_211a24c627dc';
                    editor.file[key] = loadList[i][objname];
                }
                callback();
            });
    }
}(callback);

let __wrongMark__ = false;

editor.file.file = class file {

    hasFunction = false;

    constructor(data, commentObj) {
        this.commentObj = commentObj;
        this.loadData(data);
    }

    loadData(data) {
        this.data = data;
        this.root = new node("", "", this.data, this.commentObj, this);
        this.buildNodeTree(this.root, "");
    }

    calcobj(parent, key, field, cfield, vobj, defaultcobj) {
        let cobj = null;
        if (parent.cobj && parent.cobj['_data'] && parent.cobj['_data'][key]) {
            // cobj存在时直接取
            cobj = Object.assign({}, defaultcobj, parent.cobj['_data'][key]);
        } else {
            // 当其函数时代入参数算出cobj, 不存在时只取defaultcobj
            if (parent.cobj && (parent.cobj['_data'] instanceof Function)) {
                cobj = Object.assign({}, defaultcobj, parent.cobj['_data'](key));
            }
            else cobj = Object.assign({}, defaultcobj);
        }
        let args = { field: field, cfield: cfield, vobj: vobj, cobj: cobj }
        // 当cobj的参数为函数时,代入args算出值
        for (let para in cobj) {
            if (para === '_data') continue;
            if (cobj[para] instanceof Function) cobj[para] = cobj[para](args);
        }
        return cobj;
    }

    /**
     * 把来自数据文件的obj和来自*comment.js的commentObj组装
     * commentObj在无视['_data']的意义下与obj同形
     * 即: commentObj['_data']['a']['_data']['b'] 与 obj['a']['b'] 是对应的
     *     在此意义下, 两者的结构是一致的
     *     在commentObj没有被定义的obj的分支, 会取defaultcobj作为默认值
     * 因此在深度优先遍历时,维护 
     *     field="['a']['b']"
     *     cfield="['_data']['a']['_data']['b']"
     *     vobj=obj['a']['b']
     *     cobj=commentObj['_data']['a']['_data']['b']
     * cobj
     *     cobj = Object.assign({}, defaultcobj, pcobj['_data'][key])
     *     每一项若未定义,就从defaultcobj中取
     *     当其是函数不是具体值时,把args = {field: field, cfield: cfield, vobj: vobj, cobj: cobj}代入算出该值
     * 
     * @param {node} parent 父节点
     * @param {String} pcfield 父节点注释域
     */
    buildNodeTree (parent, pcfield) {
        var keysForlistOrder = {};
        var voidMark = {};
        // 1. 按照pcobj排序生成
        if (parent.cobj && parent.cobj['_data']) {
            for (var key in parent.cobj['_data']) keysForlistOrder[key] = voidMark;
        }
        // 2. 对每个pvobj且不在pcobj的，再添加到最后
        keysForlistOrder = Object.assign(keysForlistOrder, parent.vobj)
        for (var key in keysForlistOrder) {
            // 3. 对于pcobj有但是pvobj中没有的, 弹出提示, (正常情况下editor_file会补全成null)
            //    事实上能执行到这一步工程没崩掉打不开,就继续吧..
            if (keysForlistOrder[key] === voidMark) {
                if (!__wrongMark__) {
                    console.error('comment和data不匹配,请在群 HTML5造塔技术交流群 959329661 内反馈')
                    __wrongMark__ = true;
                }
                parent.vobj[key] = null;
            }
            var field = parent.field + "['" + key + "']";
            var cfield = pcfield + "['_data']['" + key + "']";
            var vobj = parent.vobj[key];
            var cobj = this.calcobj(parent, key, field, cfield, vobj, _this.defaultcobj);
            // 标记为_hide的属性不展示
            if (cobj._hide) continue;
            parent.appendChild(node);
            // 不是叶节点时, 插入展开的标记并继续遍历
            if (!cobj._leaf) {
                this.recursionParse(node, cfield);
            }
        }
    }

    stringify() {
        JSON.stringify(this.data);
    }

    save() {

    }
}

/**
* 注释对象的默认值
*/
editor.file.defaultcobj = {
    // 默认是文本域
    _type: 'textarea',
    _data: '',
    _string: function (args) { // object~[field,cfield,vobj,cobj]
        var thiseval = args.vobj;
        return (typeof (thiseval) === typeof ('')) && thiseval[0] === '"';
    },
    // 默认情况下 非对象和数组的视为叶节点
    _leaf: function (args) { // object~[field,cfield,vobj,cobj]
        var thiseval = args.vobj;
        if (thiseval == null || thiseval == undefined) return true;//null,undefined
        if (typeof (thiseval) === typeof ('')) return true;//字符串
        if (Object.keys(thiseval).length === 0) return true;//数字,true,false,空数组,空对象
        return false;
    },
}

// 列表节点的基类
editor.file.node = class node {

    field; // 数据路径
    vobj; // 数据
    cobj; // 注释
    dataScope; // 所在列表作用域
    depth; // 编辑项深度
    propname; // 编辑项的属性名
    name; // 编辑项的中文名称

    commentHTMLescape; // 转义后的注释内容

    /**
     * 生成单个列表节点
     * @param {String} field 节点field列表 
     * @param {String} propname 节点属性名
     * @param {Object} vobj 节点数据对象
     * @param {Object} cobj 节点注释对象
     * @param {Object} dataScope 列表作用域
     */
    constructor(field, propname, vobj, cobj, dataScope) {
        this.field = field;
        this.propname = propname;
        this.vobj = vobj;
        this.cobj = cobj;
        this.dataScope = dataScope;

        this.depth = field.split("]").length-1;
        this.name = cobj["_name"] || "未注释项";

        let comment = String(cobj._data);
        this.commentHTMLescape = editor.util.HTMLescape(comment);
    }

    setValue(value) {
        if (this.checkRange(value)) {
            // editor_mode.addAction(['change', field, thiseval]);
            // editor_mode.onmode('save');//自动保存 删掉此行的话点保存按钮才会保存
            this.vobj = value;
        } else {
            // printe(this.fieldstr + ' : 输入的值不合要求,请鼠标放置在注释上查看说明');
            return false;
        }
    }

    /**
     * 检查一个值是否允许被设置为当前输入
     * @param {*} thiseval 
     */
    checkRange(thiseval) {
        if (this.cobj._range) {
            return eval(cobj._range);
        }
        return true;
    }
}

}