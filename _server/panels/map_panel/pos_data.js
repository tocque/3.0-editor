export default {
    template: /* HTML */`
    <div id="left2" class='leftTab'><!-- loc -->
        <h3 class="leftTabHeader">
            地图选点&nbsp;&nbsp;
            <button onclick="editor.mode.onmode('save')">保存</button>&nbsp;&nbsp;
            <button onclick="editor.uifunctions.addAutoEvent()">添加自动事件页</button>&nbsp;&nbsp;
            <button onclick="editor_multi.editCommentJs('loc')">配置表格</button>
        </h3>
        <div class="leftTabContent">
            <p style="margin-left: 15px">{{ pos.x + ',' + pos.y }}</p>
            <control-list ref="locTable" mode="loc"></control-list>
        </div>
    </div>`,
    data: function() {
        return {
            pos: {x: 0, y: 0}
        }
    },
    methods: {
        update: function(pos) {
            this.pos = pos;
            var objs = [];
            editor.file.editLoc(this.pos.x, this.pos.y, [], function (objs_) {
                objs = objs_;
                //console.log(objs_)
            });
            //只查询不修改时,内部实现不是异步的,所以可以这么写
            this.$refs.locTable.update(objs[0], objs[1]);
        }
    },
}