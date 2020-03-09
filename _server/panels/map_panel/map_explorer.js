import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="mapExplorer" icon="files" label="地图列表">
        <el-tree :data="data" @node-click="handleNodeClick"
            :basePadding="25" :expand-on-click-node="false"
            node-key="mapid" ref="tree"
        >
            <workspace-item 
                slot-scope="{ node, data }" gapIcon="file" icon="file"
                :node="node" :data="data" :title="data.map.access('title')"
            >{{ data.mapid }}</workspace-item>
        </el-tree>
    </mt-side-pane>`,
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    data() {
        return {
            data: [],
        }
    },
    created() {
        this.data = game.map.build;
    },
    methods: {
        handleNodeClick(item) {
            if (this.currentMapid != item.mapid) {
                this.$store.commit('openMap', item.mapid);
            }
        }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            this.$refs.tree.setCurrentKey(newValue);
        }
    },
}