import game from "../../editor_game.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="mapExplorer" icon="files" label="地图列表">
        <el-tree :data="data" @node-click="handleNodeClick"
            :basePadding="25" :expand-on-click-node="false"
            node-key="mapid" ref="tree" class="workspace-tree"
        >
            <workspace-item 
                slot-scope="{ node, data }" gapIcon="file" icon="file"
                :node="node" :data="data" :title="data.map.access('title')"
                :data-mapid="data.mapid"
            >{{ data.mapid }}</workspace-item>
        </el-tree>
        <context-menu ref="contextmenu" :addinParam="getMapid"
            bindTo=".workspace-tree"
        ></context-menu>
        <mt-window :active.sync="active" title="新建地图" width="40%" 
            class="createMap" mask closeBtn>
            <mt-form-item label="批量创建">
                <mt-switch v-model="batchCreate"></mt-switch>
            </mt-form-item>
            <mt-form-item label="新地图ID">
                <input class="mt-input" :placeholder="batchCreate ? '新地图ID' : 'MT$'+'{}'" 
                v-model="newMap.ID"/>
            </mt-form-item>
            <mt-form-item label="地图尺寸" class="batchParam">
                <span>宽</span>
                <input class="mt-input" type="number" v-model="newMap.Width"/>
                <span>高</span>
                <input class="mt-input" type="number" v-model="newMap.Height"/>
            </mt-form-item>
            <mt-form-item label="保留楼层属性">
                <mt-switch v-model="keepFloor"></mt-switch>
            </mt-form-item>
            <mt-form-item v-if="batchCreate" label="批量参数" class="batchParam">
                <span>从 i=</span>
                <input class="mt-input" type="number" v-model='batch.from'/>
                <span>到</span>
                <input class="mt-input" type="number" v-model='batch.to'/>
            </mt-form-item>
            <div class="__foot">
                <mt-btn @click="createMap(newMap)">确认创建</mt-btn>
            </div>
        </mt-window>
    </mt-side-pane>`,
    computed: Vuex.mapState({
        currentMapid: 'currentMapid',
    }),
    data() {
        return {
            data: [],
            active: false,
            batchCreate: false,
            keepFloor: false,
            newMap: {
                width: 13,
                height: 13,
                ID: "",
            },
            batch: {
                from: 1,
                to: 5
            }
        }
    },
    created() {
        this.data = game.map.getMapTree();
        this.clipboard = null;
    },
    mounted() {
        this.$refs.contextmenu.inject([
            {
                text: "新建地图",
                action: (e, h, mapid) => {
                    this.active = true;
                }
            },
            {
                text: "复制",
            },
            {
                text: "粘贴",
            }
        ])
    },
    methods: {
        handleNodeClick(item) {
            if (this.currentMapid != item.mapid) {
                this.$store.commit('openMap', item.mapid);
            }
        },
        /**@param {MouseEvent} e */
        getMapid(e) {
            const item = e.path.find((e) => {
                return e.matches && e.matches("el-tree-node__content");
            });
            if (!item) return;
            return item.firstElementChild.dataset.mapid;
        },
        createMap() {

        }
    },
    watch: {
        currentMapid(newValue, oldValue) {
            this.$refs.tree.setCurrentKey(newValue);
        }
    },
}