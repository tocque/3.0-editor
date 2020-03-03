export default {
    template: /* HTML */`
    <div pane="blockData" icon="" label="图块属性" class='leftPanel'><!-- enemyitem -->
        <h3 class="header">图块属性&nbsp;&nbsp;<button onclick="editor.mode.onmode('save')">保存</button>&nbsp;&nbsp;<button onclick="editor.mode.changeDoubleClickModeByButton('add')">添加</button>&nbsp;&nbsp;<button onclick="editor.mode.changeDoubleClickModeByButton('delete')">删除</button>&nbsp;&nbsp;<button onclick="editor_multi.editCommentJs('enemyitem')">配置表格</button>
        </h3>
        <div class="leftTabContent">
            <div id="enemyItemTable" v-show="showTable"><!-- enemy and item -->
            <control-list ref="enemyItemTable" mode="enemyItem" comment="block"></control-list>
                <div style="margin-top: -10px; margin-bottom: 10px">
                    <button id="copyEnemyItem">复制属性</button>
                    <button id="pasteEnemyItem">粘贴属性</button>
                </div>
            </div>
            <div id='newIdIdnum' v-show="!showTable"><!-- id and idnum -->
                <input placeholder="新id（唯一标识符）"/>
                <input placeholder="新idnum（10000以内数字）"/>
                <button>save</button>
                <br/>
                <button style="margin-top: 10px">自动注册</button>
            </div>
            <div id='changeId' v-show="showTable"><!-- id and idnum -->
                <input placeholder="修改图块id为"/>
                <button>save</button>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            info: {},
        }
    },
    computed: {
        showTable: function() {
            return editor.util.isset(this.info.id);
        }
    },
    methods: {
        update: function(info) {
            if (Object.keys(info).length !== 0 && info.idnum != 17) this.info = info;//避免editor.info被清空导致无法获得是物品还是怪物

            var objs = [];
            var callback = function (objs_) {
                objs = objs_;
                //console.log(objs_)
            };
            if (info.images == 'enemys' || info.images == 'enemy48') {
                editor.file.editEnemy(info.id, [], callback);
            } else if (this.images == 'items') {
                editor.file.editItem(this.info.id, [], callback);
            } else {
                /* document.getElementById('table_a3f03d4c_55b8_4ef6_b362_b345783acd72').innerHTML='';
                return; */
                editor.file.editMapBlocksInfo(info.idnum, [], callback);
            }
            //只查询不修改时,内部实现不是异步的,所以可以这么写
            this.$refs.enemyItemTable.update(objs[0], objs[1]);
        }
    },
}
