<template>
    <ul class="mt-tabs">
        <li v-for="(tab, index) of tabs" :key="index"
            :title="tab.label" @click="switchTab(tab)"
            class="mt-tab" :class="{ active: chosen == tab }">
            <slot name="tab" :tab="tab" :active="chosen == tab">{{ tab.label }}</slot>
        </li>
        <slot name="default"></slot>
    </ul>
</template>

<script>
import { isset } from "../../utils.js";

export default {
    name: "mt-tabs",
    props: ["tabs", "init", "allowUnchose"],
    data() {
        return {
            chosen: null
        }
    },
    created() {
        if (this.init) {
            for (let t of this.tabs) {
                if (t.id == this.init) {
                    this.switchTab(t); 
                    break;
                }
            }
        }
    },
    methods: {
        switchTab(tab, force) {
            if (!force && isset(this.allowUnchose) && tab == this.chosen) {
                this.chosen = null;
                this.$emit('switch', null);
            } else {
                this.chosen = tab;
                this.$emit('switch', tab);
            }
        },
    },
}
</script>

<style>

</style>