import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="mapData" icon="list-unordered" label="楼层属性">
        <control-list ref="floorTable" comment="floor"></control-list>
    </mt-side-pane>`,
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    data: function() {
        return {
            data: null,
        }
    },
    created() {

    },
    inject: ["getCurrentMap"],
    methods: {
        changeFloorId: function () {
            var floorId = this.changeToId;
            if (floorId) {
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(floorId)) {
                    printe("楼层名 " + floorId + " 不合法！请使用字母、数字、下划线，且不能以数字开头！");
                    return;
                }
                if (main.floorIds.indexOf(floorId) >= 0) {
                    printe("楼层名 " + floorId + " 已存在！");
                    return;
                }
                var currentFloorId = editor.currentFloorId;
                editor.currentFloorId = floorId;
                editor.currentFloorData.floorId = floorId;
                editor.file.saveFloorFile(function (err) {
                    if (err) {
                        printe(err);
                        throw (err);
                    }
                    core.floorIds[core.floorIds.indexOf(currentFloorId)] = floorId;
                    editor.file.editTower([['change', "['main']['floorIds']", core.floorIds]], function (objs_) {//console.log(objs_);
                        if (objs_.slice(-1)[0] != null) {
                            printe(objs_.slice(-1)[0]);
                            throw (objs_.slice(-1)[0])
                        }
                        alert("修改floorId成功，需要刷新编辑器生效。\n请注意，原始的楼层文件没有删除，请根据需要手动删除。");
                        window.location.reload();
                    });
                });
            } else {
                printe('请输入要修改到的floorId');
            }
        },
        update: function() {
            var objs = [];
            editor.file.editFloor([], function (objs_) {
                objs = objs_;
                //console.log(objs_)
            });
            //只查询不修改时,内部实现不是异步的,所以可以这么写
            this.$refs.floorTable.update(objs[0], objs[1]);
        }
    },
    watch: {
        currentMapid() {
            this.$refs.floorTable.update(this.getCurrentMap());
        }
    },
}
