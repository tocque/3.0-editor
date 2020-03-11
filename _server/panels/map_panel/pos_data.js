export default {
    template: /* HTML */`
    <mt-side-pane pane="posData" icon="debug-step-into" label="地图选点">
        <div class="leftTabContent">
            <p style="margin-left: 15px">{{ pos.x + ',' + pos.y }}</p>
            <control-list ref="locTable" :data="data" comment="loc"></control-list>
        </div>
    </mt-side-pane>`,
    data: function() {
        return {
            pos: { x: 0, y: 0 },
            data: null,
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