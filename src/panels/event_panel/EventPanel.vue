<template>
    <div class="main-side-layout" id="commoneventPanel">
        <mt-side class="left" :tucked.sync="leftCollapsed">
            <commonevent-tree active ref="commoneventTree" @openTab="openTab"></commonevent-tree>
        </mt-side>
        <status-item></status-item>
    </div>
</template>

<script>
import CommoneventTree from "./CommoneventTree.vue";

export default {
    data() {
        return {
            active: false,
            tabs: [],
            viewer: null,
            tab: {},
            leftCollapsed: false,
        }
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    methods: {
        openTab(tab) {

        },
    },
    components: {
        CommoneventTree
    },
}
</script>
