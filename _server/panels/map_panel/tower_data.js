editor.map_panel.towerData = {
    template: /* HTML */`
    <div id="left5" class='leftTab'><!-- tower -->
        <h3 class="leftTabHeader">全塔属性&nbsp;&nbsp;<button onclick="editor.mode.onmode('save')">保存</button>&nbsp;&nbsp;<button onclick="editor.mode.changeDoubleClickModeByButton('add')">添加</button>&nbsp;&nbsp;<button onclick="editor_multi.editCommentJs('tower')">配置表格</button>
        </h3>
        <div class="leftTabContent">
            <control-list ref="towerTable" mode="tower"></control-list>
        </div>
    </div>`,
    methods: {
        update: function() {
            var objs = [];
            editor.file.editTower([], function (objs_) {
                objs = objs_;
                //console.log(objs_)
            });
            //只查询不修改时,内部实现不是异步的,所以可以这么写
            this.$refs.towerTable.update(objs[0], objs[1]);
        }
    },
}