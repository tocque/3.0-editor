/**
 * @file map_panel/index.js 地图编辑界面入口
 */
import game from "../../editor_game.js";
import listen from "../../editor_listen.js";

import tiledEditor from "../../tiled/tiled_editor.js"

import mapExplorer from "./map_explorer.js";
import posData from "./pos_data.js";
import blockData from "./block_data.js";
import mapData from "./map_data.js";

let components = {
    mapExplorer, posData, blockData, mapData, tiledEditor,
}

import { mapStore } from "./service.js";

export default {
    label: "地图",
    template: /* HTML */`
    <div id="mapPanel">
        <mt-side class="left transition" :tucked.sync="leftCollapsed">
            <map-explorer active></map-explorer>
            <map-data></map-data>
        </mt-side>
        <div class="mid" :class="{ expend: leftCollapsed }">
            <tiled-editor ref="tiledEditor" @showBlock="showBlock"></tiled-editor>
        </div>
        <status-item v-show="active">{{ currentMapid }}</status-item>
    </div>`,
    store: mapStore,
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    data: function() {
        return {
            active: false,
            leftCollapsed: false,
            actionList: [],
            mode: '',
            info: {},
            doubleClickMode: 'change',
            // 画图区菜单
            lastRightButtonPos: [{x:0,y:0}, {x:0,y:0}],
            // 数据
            currentMap: null,
        }
    },
    created() {
        listen.regShortcut("b.ctrl", {
            action: () => { this.leftCollapsed = !this.leftCollapsed },
            condition: () => this.active
        })
    },
    mounted() {
        const mapid = editor.towerInfo.get("lastEditFloorId", 
            game.data.getStartpos("floorId"));
        this.$store.commit('openMap', mapid);
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    methods: {
        showBlock() {

        }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            if (this.currentMap) this.currentMap.save();
            this.currentMap = game.map.getMap(newValue);
            this.$refs.tiledEditor.ready.then((e) => {
                e.openMap(newValue);
            })
        }
    },
    components,
}