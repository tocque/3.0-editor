<template>
    <li class="status-item" @click="$emit('trigger', this)">
        <slot></slot>
    </li>
</template>

<script>
import { isset } from "../utils.js"

export default {
    name: "status-item",
    props: ["left", "priority"],
    inject: ["injectStatusItem"],
    mounted() {
        this.$el.dataset.priority = this.priority || 0;
        this.injectStatusItem(isset(this.left) ? "left" : "right", this);
    }
}
</script>

<style lang="less">
li.status-item {
    padding: 0 6px;
    height: 100%;
    margin-inline-start: 3px;
    margin-inline-end: 3px;
    line-height: 27px;
    // display: none;
    &:hover {
        background-color: var(--c-status-hl);
    }
    &.active {
        display: inline-block;
    }
    span {
        line-height: 26px;
    }
}
</style>