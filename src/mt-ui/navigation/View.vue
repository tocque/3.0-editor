<template>
    <div class="mt-view">
        <mt-tabs :tabs="tabs" ref="tabs" @switch="switchTab">
            <template #tab="{ tab }">
                <slot name="tab">
                    <mt-icon :icon="tab.icon" :size="18"></mt-icon>
                    <span>{{ tab.label }}</span>
                    <mt-icon 
                        v-if="canClose != null"
                        :icon="tab.editted ? 'circle-filled' : 'close'"
                        @click.stop="closeTab(tab)" :size="18"
                        class="status-icon" :class="{ editted: tab.editted }"
                    ></mt-icon>
                </slot>
            </template>
        </mt-tabs>
        <div class="mt-view__toolBar">
            <slot name="tools"></slot>
            <div v-if="canClose != null">
                <li></li>
            </div>
        </div>
    </div>
</template>

<script>
import MtIcon from "../others/Icon.vue"

export default {
    name: "mt-view",
    props: ["canClose"],
    data() {
        return {
            tabNow: null,
            tabs: []
        }
    },
    created() {
        this.keys = {};
    },
    methods: {
        init(tabs = []) {
            this.keys = {};
            this.tabs.splice(0, this.tabs.length, ...tabs);
            for (let tab of tabs) this.keys[this.getKey(tab)] = tab;
        },
        getKey(tab) {
            return tab.type + tab.id;
        },
        openTab(tab) {
            const key = this.getKey(tab);
            if (!this.keys[key]) {
                this.keys[key] = tab;
                this.insertTabAfter(tab, this.tabNow);
            }
            this.$refs.tabs.switchTab(this.keys[key]);
        },
        switchTab(tab) {
            this.$emit('switch', tab);
            this.tabNow = tab;
        },
        openTabByKey(key) {
            if (this.keys[key]) this.openTab(this.keys[key]);
        },
        insertTabAfter(tab, after) {
            const index = after ? this.tabs.indexOf(after) + 1 : 0;
            this.tabs.splice(index, 0, tab);
        },
        closeTab(tab) {
            const handler = {};
            this.$emit("close", tab, handler);
            if (handler.prevent) return;
            const index = this.tabs.indexOf(tab);
            this.tabs.splice(index, 1);
            const key = this.getKey(tab);
            delete this.keys[key];
            if (this.tabs.length == 0) {
                this.$refs.tabs.chosen = null;
                this.$emit('switch', null);
            } else {
                if (this.tabs.length == index) {
                    this.openTab(this.tabs[index-1]);
                } else this.openTab(this.tabs[index]);
            }
        },
        closeAll() {
            const handler = {};
            for (let tab of this.tabs) {
                this.$emit("close", tab, handler);
                if (handler.prevent) return;
            }
            this.init();
            this.$refs.tabs.chosen = null;
            this.$emit('switch', null);
        }
    },
    components: { MtIcon },
}
</script>

<style lang="less">
.mt-view {
    position: relative;
    overflow: hidden;
    height: 35px;
    display: flex;
    background: var(--c-bg-pop);
    .mt-tabs {
        display: flex;
    }
    .mt-tab {
        width: 120px;
        min-width: fit-content;
        min-width: -moz-fit-content;
        flex-shrink: 0;
        position: relative;
        display: flex;
        align-items: center;
        white-space: nowrap;
        cursor: pointer;
        height: 35px;
        box-sizing: border-box;
        padding-left: 10px;
        background-color: var(--c-tab);
        --separator-border: #444444;
        border-right: 1px solid var(--c-bg-pop);
        &.active {
            span {
                color: var(--c-text-hl);
            }
            .status-icon {
                visibility: visible;
            }
            background-color: var(--c-tab-hl);
        }
        &:hover {
            .status-icon {
                visibility: visible;
            }
        }
        span {
            font-size: 14px;
            padding: 0 2px;
            color: var(--c-text);
        }
        .type-icon {
            padding: 2px;
        }
        .status-icon {
            &.editted {
                visibility: visible;
            }
            color: var(--c-icon);
            padding: 8px;
            margin-left: auto;
            visibility: hidden;
        }
    }
    &__toolBar {
        display: flex;
        align-items: center;
        margin-left: auto;
        padding: 0px 2px;
        .__toolGroup {
            display: flex;
            align-items: center;
            height: 14px;
            border-left: 1px var(--c-text) solid;
            border-right: 1px var(--c-text) solid;
        }
        .__toolGroup + .__toolGroup {
            border-left: none;
        }
    }
}
</style>