import game from "../../editor_game.js";
import { isset } from "../../editor_util.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="commenteventTree" icon="files" label="公共事件">
        <el-tree :data="data" @node-click="handleNodeClick" class="workspace-tree"
            :basePadding="25" :indent="10" node-key="field" ref="tree"
        >
            <workspace-item 
                slot-scope="{ node, data }" icon="file"
                :node="node" :data="data" :title="data.name"
            >{{ data.name }}</workspace-item>
        </el-tree>
    </mt-side-pane>`,
    data() {
        return {
            data: null,
        }
    },
    async created() {
        this.data = this.buildEventList();
    },
    inject: [ "openBlockly" ],
    methods: {
        buildEventList() {
            const list = [], events = game.data.getCommonEvents();
            for (let c in events) {
                list.push({
                    field: `[commonEvent][${c}]`,
                    name: c,
                    event: events[c]
                })
            }
            return list
        },
        async handleNodeClick(data, node) {
            if (!node.isLeaf) return;
            const eventText = JSON.stringify(data.event);
            const res = await this.openBlockly(eventText, "event");
            if (isset(res) && res != eventText) {
                data.event = JSON.parse(res);
                this.saveData(data);
            }
        },
        saveData(data) {
            game.data.events.modify({ key: data.field, value: data.event });
        }
    },
}
