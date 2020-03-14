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
import { isset } from "../../editor_util.js";

export default {
    label: "地图",
    template: /* HTML */`
    <div id="mapPanel">
        <mt-side class="left transition" :tucked.sync="leftCollapsed" ref="side">
            <map-explorer active></map-explorer>
            <map-data></map-data>
            <pos-data ref="posData"></pos-data>
            <block-data ref="blockData"></block-data>
        </mt-side>
        <div class="mid" :class="{ expend: leftCollapsed }">
            <tiled-editor ref="tiledEditor" :map="currentMap"
                @selectPos="editPos" @selectBlock="editBlock" @save="updateMapArray"
            ></tiled-editor>
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
    provide() {
        return {
            getCurrentMap: this.getCurrentMap,
            updateMap: this.updateMap,
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
            if (!isset(map)) map = game.map.getMap(this.currentMapid); 
            else {
                this.currentMap = map;
                game.map.forceUpdateMap(map).then(() => {
                    this.currentMap = game.map.getMap(this.currentMapid);
                });
            }
        },
        updateMapArray(mapArray) {
            game.map.updateMapArray(this.currentMapid, mapArray).then(() => {
                this.currentMap = game.map.getMap(this.currentMapid);
            });
        }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            this.currentMap = game.map.getMap(newValue);
            this.$refs.tiledEditor.ready.then((e) => {
                e.openMap(newValue);
            })
        }
    },
    components,
}