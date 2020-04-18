<template>
    <mt-side-pane pane="scriptTree" icon="files" label="脚本浏览">
        <div class="container">
            <el-tree :data="data" @node-click="handleNodeClick" class="workspace-tree"
                :basePadding="25" :indent="10" node-key="field" ref="tree"
            >
                <workspace-node 
                    slot-scope="{ node, data }" icon="javascript"
                    :node="node" :data="data" :title="data.comment._data+data.field"
                >{{ data.key }}</workspace-node>
            </el-tree>
        </div>
    </mt-side-pane>
</template>

<script>
import game from "../../game.js";
import { buildTree } from "../../tree/index.js";

export default {
    data() {
        return {
            data: null,
        }
    },
    async created() {
        const scriptComment = game.get("data/functions/comment");
        const data = game.get("data/functions/file");
        this.data = buildTree(data, scriptComment).children;
    },
    methods: {
        handleNodeClick(data, node) {
            if (!node.isLeaf) return;
            const text = game.get("data/functions/file", data.field, "content")
            this.$emit('openTab', {
                type: "script",
                id: data.field,
                text,
                label: data.key,
                editted: false,
                icon: "javascript"
            })
        },
        async saveNode(node) {
            game.update("data/functions/file", { key: node.id, value: node.text });
        }
    },
}
</script>

<style>

</style>
