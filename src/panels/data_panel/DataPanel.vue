<template>
    <div id="dataPanel">
        <mt-side-pane label="全局数据">
            <form-tree commentsrc="data/data/comments/main"
                ref="main" @changeNode.native="onchange('main', $event)"
            ></form-tree>
        </mt-side-pane>
        <mt-side-pane label="初始数据">
            <form-tree commentsrc="data/data/comments/firstData"
                ref="firstData" @changeNode.native="onchange('firstData', $event)"
            ></form-tree>
        </mt-side-pane>
        <mt-side-pane label="全局变量">
            <form-tree commentsrc="data/data/comments/values"
                ref="values" @changeNode.native="onchange('values', $event)"
            ></form-tree>
        </mt-side-pane>
        <mt-side-pane label="全局开关">
            <form-tree commentsrc="data/data/comments/flags"
                ref="flags" @changeNode.native="onchange('flags', $event)"
            ></form-tree>
        </mt-side-pane>
    </div>
</template>

<script>
import game from "../../game.js";

export default {
    label: "数据",
    data() {
        return {
            active: false,
        }
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    mounted() {
        this.update();
    },
    methods: {
        update() {
            const data = game.get("data/data/file");
            ["main", "firstData", "values", "flags"].forEach((e) => {
                this.$refs[e].update(data[e])
            })
        },
        onchange(type, { detail: { field, value } }) {
            game.update(`data/data/file`, { key: `[${type}]${field}`, value});
        }
    },
    components: {

    },
}
</script>

<style lang="less">
#dataPanel {
    display: flex;
    .mt-side-pane {
        position: relative;
        height: 100%;
        width: 25%;
        &__content, .form-tree {
            width: 100%;
            height: calc(100% - 45px);
        }
    }    
}
</style>
