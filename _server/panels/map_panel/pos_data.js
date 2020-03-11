import { Pos } from "../../editor_util.js";
import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="posData" icon="debug-step-into" label="地图选点">
        <template #header>
            <span class="pos-indicator">({{ pos.x + ', ' + pos.y }})</span>
        </template>
        <control-list ref="locTable" :data="data" comment="loc"></control-list>
    </mt-side-pane>`,
    data: function() {
        return {
            pos: new Pos(),
            data: null,
        }
    },
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    inject: ["getCurrentMap"],
    methods: {
        update: function(pos) {
            this.pos.set(pos);
            const posInfo = game.map.getPosInfo(this.getCurrentMap(), pos);
            this.$refs.locTable.update(posInfo);
        }
    },
    watch: {
        currentMapid() {
            //this.$refs.floorTable.update(this.getCurrentMap().data);
        }
    },
}