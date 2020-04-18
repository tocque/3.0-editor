<template>
    <mt-side-pane pane="mapExplorer" icon="files" label="地图列表">
        <div class="container">
            <el-tree :data="data" @node-click="handleNodeClick"
                :basePadding="25" :expand-on-click-node="false"
                node-key="mapid" ref="tree" class="workspace-tree"
                @node-contextmenu="openMenu"
            >
                <workspace-node 
                    slot-scope="{ node, data }" gapIcon="file" icon="file"
                    :node="node" :data="data" :title="data.info.title"
                    :data-mapid="data.mapid"
                >{{ data.mapid }}</workspace-node>
            </el-tree>
        </div>
        <context-menu ref="contextmenu"></context-menu>
        <create-map-form ref="form"></create-map-form>
    </mt-side-pane>
</template>

<script>
import game from "../../game.js";
import CreateMapForm from "./CreateMapForm.vue"
import { isset } from '../../utils.js';

export default {
    computed: Vuex.mapState('map', {
        currentMapid: 'currentMapid',
    }),
    data() {
        return {
            data: [],
            clipboard: null
        }
    },
    created() {
        this.data = game.get("map/tree");
    },
    mounted() {
        this.$refs.contextmenu.inject([
            {
                text: "新建地图",
                action: async (e, mapid) => {
                    const param = await this.$refs.form.open();
                    if (!isset(param)) return;
                    param.now = this.currentMapid;
                    this.createMap(param, mapid);
                }
            },
            {
                text: "复制",
                action: async (e, mapid) => {
                    this.clipboard = mapid;
                }
            },
            {
                text: "粘贴",
                action: async (e, mapid) => {
                    const node = await game.post("map/paste", this.clipboard, mapid);
                    this.$refs.tree.append(node, mapid);
                },
                validate: () => isset(this.clipboard)
            },
            // {
            //     text: "删除",
            //     action: async (e, mapid) => {
            //         await game.post("map/delete", mapid);
            //         this.$refs.tree.append(this.$refs.tree.getNode(mapid));
            //     },
            // },
            // {
            //     text: "重命名",
            //     action: async (e, mapid) => {
            //         this.$prompt("新名称")
            //         game.post("map/rename", this.clipboard, mapid);
            //     }
            // }
        ])
    },
    methods: {
        handleNodeClick(item) {
            if (this.currentMapid != item.mapid) {
                this.$store.commit('map/openMap', item.mapid);
            }
        },
        /**@param {MouseEvent} e */
        openMenu(e, item) {
            this.$refs.contextmenu.open(e, item.mapid);
        },
        createMap(param, mapid) {
            game.post("map/create", param, mapid)
        }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            this.$refs.tree.setCurrentKey(newValue);
        }
    },
    components: {
        CreateMapForm
    }
}
</script>

<style lang="less">
</style>
