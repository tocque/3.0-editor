<template>
    <mt-side-pane pane="commenteventTree" icon="files" label="公共事件">
        <div class="container">
            <el-tree :data="data" @node-click="handleNodeClick" class="workspace-tree"
                :basePadding="25" :indent="10" node-key="field" ref="tree"
            >
                <workspace-node 
                    slot-scope="{ node, data }" icon="file"
                    :node="node" :data="data" :title="data.name"
                >{{ data.name }}</workspace-node>
            </el-tree>
        </div>
    </mt-side-pane>
</template>

<script>
import game from "../../game.js";
import { isset } from "../../utils.js";

export default {
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
            const list = [], events = game.get("data/events/commonevents");
            for (let c in events) {
                list.push({
                    field: `[${c}]`,
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
                await this.saveData(data);
            }
        },
        async saveData({ field, event }) {
            return game.update(`data/events/commonevents`, { key: field, value: event });
        }
    },
}
</script>
