import game from "../../editor_game.js";
import { buildTree } from "../../mt-ui/tree.js";

export default {
    template: /* HTML */`
    <mt-side-pane pane="scriptTree" icon="files" label="脚本浏览">
        <el-tree :data="data" @node-click="handleNodeClick"
            :basePadding="25" :indent="10" node-key="field" ref="tree"
        >
            <workspace-item 
                slot-scope="{ node, data }" icon="javascript"
                :node="node" :data="data" :title="data.field"
            >{{ data.key }}<span>{{ data.comment._name }}</span></workspace-item>
        </el-tree>
    </mt-side-pane>`,
    data: function() {
        return {
            data: null,
        }
    },
    async created() {
        const scriptComment = (await import('../../comments/functions.comment.js')).default;
        this.data = buildTree(game.data.functions.data, scriptComment).children;
    },
    methods: {
        handleNodeClick(data, node) {
            if (!node.isLeaf) return;
            this.$emit('openTab', {
                type: "script",
                id: data.field,
                text: game.data.functions.access(data.field),
                label: data.key,
                editted: false,
                icon: "javascript"
            })
        },
        async saveNode(node) {
            game.data.functions.modify({ key: node.id, value: node.text });
        }
    },
}
