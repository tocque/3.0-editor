<template>
    <div class="mt-side" :class="{ 'collapsed': this.tucked }">
        <div class="mt-side__switcher">
            <mt-tabs :tabs="panels" allowUnchose
                @switch="switchPane" ref="switcher"
            >
                <template #tab="{ tab }">
                    <mt-icon :icon="tab.icon" :size="30"></mt-icon>
                </template>
            </mt-tabs>
        </div>
        <div class="mt-side__panel">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import { isset } from "../../utils.js";

export default {
    name: "mt-side",
    props: ["tucked"],
    data() {
        return {
            chosen: null,
            panels: [],
        }
    },
    mounted() {
        const panes = this.$slots.default;
        this.$nextTick(() => {
            for (let pane of panes) {
                if (!pane.elm.getAttribute) continue;
                const attr = p => pane.elm.getAttribute(p);
                const tab = { 
                    id: attr("pane"), 
                    icon: attr("icon"), 
                    elm: pane.elm
                };
                this.panels.push(tab);
                if (isset(pane.elm.getAttribute("active"))) {
                    this.$refs.switcher.switchTab(tab);
                }
            }
        });
    },
    methods: {
        switchPane(pane) {
            if (!isset(pane)) {
                this.toggle();
            } else {
                if (isset(this.chosen)) {
                    this.chosen.elm.removeAttribute("active");
                }
                this.chosen = pane;
                this.chosen.elm.setAttribute("active", "");
                this.toggle(false);
                this.$emit("switch", pane);
            }
        },
        toggle(code) {
            if (!isset(code)) code = !this.tucked;
            this.$emit("update:tucked", code);
        },
        openPane(pane, force) {
            if (this.chosen.id == pane) return;
            if (!force && this.tucked) return;
            const panel = this.panels.find((panel) => panel.id == pane);
            this.$refs.switcher.switchTab(panel, true);
        }
    }
}
</script>

<style lang="less">
.mt-side {
    &__switcher {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 8;
        width: 50px;
        background-color: var(--c-side);
        padding-block-start: 10px;
        box-shadow: 3px 0px 3px var(--c-shadow);
        li {
            cursor: pointer;
            width: 30px;
            height: 30px;
            padding: 10px;
            i.mt-icon {
                color: var(--c-text);
            }
            &:hover {
                i.mt-icon {
                    color: var(--c-text-hl);
                }
            }
            &.active {
                i.mt-icon {
                    color: var(--c-text-hl);
                }
                padding: 10px 10px 10px 8px;
                border-left: 2px solid white;
            }
        }
    }
    &.collapsed {
        width: 50px;
        .mt-side__panel {
            left: -230px;
        }
    }
    &__panel {
        position: absolute;
        left: 50px;
        top: 0;
        bottom: 0;
        width: 280px;
        &>div {
            left: 0px;
            right: 0px;
            top: 0px;
            bottom: 0px;
            position: absolute;
            display: none;
            &[active] {
                display: block;
            }
        }
    }
    .container {
        left: 5px;
        right: 2px;
        bottom: 0;
        top: 45px;
    }
    &.transition {
        // &.collapsed {
        //     transition: cubic-bezier(1, 0.03, 1, -0.24) width 1.2s;
        // }
        >.__panel {
            transition: left 1s;
        }
    }
}
</style>