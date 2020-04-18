<template>
    <mt-side-pane pane="posData" icon="debug-step-into" label="地图选点">
        <template #header>
            <span class="pos-indicator">({{ pos.x + ', ' + pos.y }})</span>
        </template>
        
    </mt-side-pane>
</template>

<script>
import { Pos } from "../../utils.js";
import game from "../../game.js";

export default {
    data() {
        return {
            pos: new Pos()
        }
    },
    computed: Vuex.mapState('map', {
        currentMapid: 'currentMapid',
    }),
    inject: ["getCurrentMap", "updateMap"],
    methods: {
        update(pos) {
            this.pos.set(pos);
            const posInfo = game.get("map/pos", pos, this.getCurrentMap());
            this.$refs.locTable.update(posInfo.events);
        },
        /**@param {CustomEvent} e */
        onchange({ detail: { field, value } }) {
            const map = game.map.modifyPos(this.getCurrentMap(), this.pos, field, value);
            this.updateMap(map);
        }
    },
    watch: {
        currentMapid() {
            //this.$refs.floorTable.update(this.getCurrentMap().data);
        }
    },
}
</script>

<style lang="less" scoped>
    .pos-indicator {
        color: var(--c-text);
        font-size: 14px;
        font-weight: bold;
    }
</style>
