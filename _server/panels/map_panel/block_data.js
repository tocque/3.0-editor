import { isset } from "../../editor_util.js";
import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="blockData" icon="map" label="图块属性">
        <template #header v-show="info.id">
            <div class="icon-btn" title="复制"><mt-icon icon="files"></mt-icon></div>
            <div class="icon-btn" title="粘贴"><mt-icon icon="clippy"></mt-icon></div>
        </template>
        <control-list v-show="info.id" ref="blockTable" comment="enemy"></control-list>
        <div class='newIdIdnum' v-show="info.type && !info.id"><!-- id and idnum -->
            <input placeholder="新id（唯一标识符）"/>
            <input placeholder="新idnum（10000以内数字）"/>
            <button>save</button>
            <br/>
            <button style="margin-top: 10px">自动注册</button>
        </div>
    </mt-side-pane>`,
    data() {
        return {
            info: { type: null, id: null, index: null },
        }
    },
    methods: {
        /**
         * @param {Block} block 
         */
        update: function(block) {
            this.info.type = block.type;
            this.info.id = block.id;
            this.info.index = block.index;
            if (!block.id) {
                return;
            }
            let data, comment;
            if (["enemys", "enemy48"].includes(block.cls)) {
                [data, comment] = game.data.getEnemyInfo(block.id);
                this.info.type = "enemy";
            } else if (["items"].includes(block.cls)) {
                [data, comment] = game.data.getItemInfo(block.id);
                this.info.type = "item";
            } else {
                [data, comment] = game.data.getBlockInfo(block.number);
                this.info.type = "mapBlock";
            }
            // this.pos.set(pos);
            // const posInfo = game.map.getPosInfo(pos, this.getCurrentMap());
            this.$refs.blockTable.update(data, comment);
        }
    },
}
