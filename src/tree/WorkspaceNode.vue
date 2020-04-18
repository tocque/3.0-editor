<template>
    <span class="workspace-node">
        <mt-icon v-if="node.isLeaf || gapIcon" 
            :icon="node.isLeaf ? icon : gapIcon"
        ></mt-icon>
        <slot></slot>
        <mt-icon v-show="data.unsave" icon="circle-filled"></mt-icon>
    </span>
</template>

<script>
export default {
    name: "workspace-node",
    props: ["node", "data", "icon", "gapIcon"],
}
</script>

<style>

</style>