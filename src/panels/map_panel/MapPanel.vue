<template>
    <div id="mapPanel">
        <mt-side class="left transition" :tucked.sync="leftCollapsed" ref="side">
            <map-explorer active></map-explorer>
            <map-data></map-data>
            <pos-data ref="posData"></pos-data>
            <block-data ref="blockData"></block-data>
        </mt-side>
        <div class="mid" :class="{ expend: leftCollapsed }">
            <tiled-editor ref="tiledEditor" :map="currentMap"
                @selectPos="editPos" @selectBlock="editBlock" @save="updateMap"
            ></tiled-editor>
        </div>
        <status-item v-show="active">{{ currentMapid }}</status-item>
    </div>
</template>

<script>
import "./service.js";
import { isset } from "../../utils.js";
import game from "../../game.js";

import MapExplorer from "./MapExplorer.vue";
import PosData from "./PosData.vue";
import BlockData from "./BlockData.vue";
import MapData from "./MapData.vue";

export default {
    label: "地图",
    computed: Vuex.mapState("map", {
        currentMapid: 'currentMapid',
    }),
    data() {
        return {
            active: false,
            leftCollapsed: false,
            currentMap: null
        }
    },
    provide() {
        return {
            getCurrentMap: this.getCurrentMap,
            updateMap: this.updateMap,
        }
    },
    created() {
        this.$regShortcut("b.ctrl", {
            action: () => { this.leftCollapsed = !this.leftCollapsed },
            condition: () => this.active
        })
    },
    mounted() {
        const mapid = game.get("userdata/lastEditMap");
        this.$store.commit('map/openMap', mapid);
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    methods: {
        getCurrentMap() {
            return this.currentMap;
        },
        editBlock(block) {
            this.$refs.blockData.update(block);
            this.$refs.side.openPane("blockData");
        },
        editPos(pos) {
            this.$refs.posData.update(pos);
            this.$refs.side.openPane("posData", true);
        },
        updateMap(map) {
            if (!isset(map)) map = game.get(`map/${this.currentMapid}/file`); 
            else {
                this.currentMap = map;
                game.update(`map/${this.currentMapid}/file`, map).then(() => {
                    this.currentMap = game.get(`map/${this.currentMapid}/file`);
                });
            }
        },
        // async updateMapArray(mapArray) {
        //     await game.update(`map/${this.currentMapid}/mapArray`, mapArray);
        //     this.currentMap = game.get(`map/${this.currentMapid}/file`);
        // }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            this.currentMap = game.get(`map/${newValue}/file`);
            this.$refs.tiledEditor.ready.then((e) => {
                e.openMap(newValue);
            })
        }
    },
    components: {
        MapExplorer, PosData, BlockData, MapData
    },
}
</script>

<style lang="less">
#mapPanel {
    .left {
        .container {
            left: 5px;
            right: 2px;
            bottom: 0;
            top: 45px;
        }
    }
    .mid {
        left : 330px;
        right: 0;
        &.expend {
            left: 50px;
        }
        transition: left 1s;
    }
}
</style>
