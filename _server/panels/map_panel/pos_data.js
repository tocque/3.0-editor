import { Pos } from "../../editor_util.js";
import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="posData" icon="debug-step-into" label="地图选点">
        <template #header>
            <span class="pos-indicator">({{ pos.x + ', ' + pos.y }})</span>
        </template>
        <control-list ref="locTable" comment="loc" 
            @changeNode.native="onchange"
        ></control-list>
    </mt-side-pane>`,
    data: function() {
        return {
            pos: new Pos()
        }
    },
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    inject: ["getCurrentMap", "updateMap"],
    methods: {
        update(pos) {
            this.pos.set(pos);
            const posInfo = game.map.getPosInfo(pos, this.getCurrentMap());
            this.$refs.locTable.update(posInfo.events);
        },
        /**@param {CustomEvent} e */
        onchange({ detail: { field, value } }) {
            const map = game.map.modifyPos(this.getCurrentMap(), pos, field, value);
            this.updateMap(map);
        }
    },
    watch: {
        currentMapid() {
            //this.$refs.floorTable.update(this.getCurrentMap().data);
        }
    },
}