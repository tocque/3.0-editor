<template>
    <div class="container form-tree">
        <el-tree :data="tree"
            :basePadding="10" ref="tree"
            @node-contextmenu="openMenu"
        >
            <form-node 
                slot-scope="{ node, data }" :node="node" :data="data"
            ></form-node>
        </el-tree>
        <context-menu ref="contextmenu"></context-menu>
    </div>
</template>

<script>
import game from "../game.js"
import { buildTree } from "./tree.js"
import FormNode from "./FormNode.vue"

export default {
    name: "form-tree",
    props: ["commentsrc"],
    data() {
        return {
            commentObj: {},
            tree: [],
        }
    },
    async created() {
        this.commentObj = game.get(this.commentsrc);
    },
    mounted() {
        this.$refs.contextmenu.inject([
            {
                text: "删除该项",
                action: (e, item) => this.deleteItem(item),
                vaildate: false
            },
            {
                text: "编辑该项",
                action: (e, item) => this.editItem(item),
                vaildate: false
            },
            {
                text: "插入新项",
                action: (e, item) => this.insertItem(item),
                vaildate: false
            }
        ])
    },
    methods: {
        async deleteItem(item) {
            this.commentObj
            await game.post(this.commentsrc+"/delete", item.field);
        },
        async editItem(item) {
            this.commentObj
            await game.post(this.commentsrc+"/delete", item.field);
        },
        async insertItem(item) {
            this.commentObj
            await game.post(this.commentsrc+"/delete", item.field);
        },
        update(data) {
            this.data = data;
            this.tree = buildTree(data, this.commentObj).children;
        },
        /** @param {MouseEvent} e */
        openMenu(e, item) {
            this.$refs.contextmenu.open(e, item);
        }
    },
    watch: {
        commentsrc(newsrc) {
            this.commentObj = game.get(newsrc);
        }
    },
    components: {
        FormNode
    }
}
</script>

<style lang="less">
.el-tree {
    max-width: 400px;
    background-color: #222;
    padding: 5px 0;
    .el-tree-node {
        outline: none;
        &.is-current > .el-tree-node__content {
            background-color: var(--c-item-hl);
        }
    }
    .el-tree-node__content {
        color: var(--c-text);
        padding: 5px 10px;
        user-select: none;
        display: flex;
        align-items: center;
        .el-tree-node__expand-icon {
            margin-left: -16px;
            &.expanded {
                transform: rotate(90deg);
            }
        }
        &:hover {
            background-color: var(--c-item-hv);
        }
    }
    .el-tree__empty-block {
        display: none;
    }
    .el-tree__drop-indicator {
        background-color: var(--c-item-hl);
    }
    &.workspace-tree .el-tree-node__content {
        cursor: pointer;
    }
}
</style>