import { isset } from "../editor_util.js";

/**
 * 标签组件, 导航类的基组件
 */
export const MtTabs = {
    name: "mt-tabs",
    template: /* HTML */`
        <ul class="mt-tabs">
            <li v-for="(tab, index) of tabs" :key="index"
                :title="tab.label" @click="switchTab(tab)"
                class="mt-tab" :class="{ active: chosen == tab.id }">
                <slot name="tab" :tab="tab" :active="chosen == tab.id">{{ tab.label }}</slot>
            </li>
            <slot name="default"></slot>
        </ul>
    `,
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
            if (!force && isset(this.allowUnchose) && tab.id == this.chosen) {
                this.chosen = null;
                this.$emit('switch', null);
            } else {
                this.chosen = tab.id;
                this.$emit('switch', tab);
            }
        },
    },
};

/**
 * 侧边栏组件
 */
export const MtSide = {
    name: "mt-side",
    render(h) {
        const panels = this.$slots.default;
        return h('div', { class: ["side-bar", { "collapsed": this.tucked }] }, [
            h('div', { class: "side-switcher" }, [
                h('mt-tabs', {
                    props: {
                        tabs: this.panels,
                        allowUnchose: true,
                    },
                    on: {
                        switch: this.switchPane
                    },
                    scopedSlots: {
                        tab: props => h('i', {
                            class: ["codicon", "codicon-"+props.tab.icon]
                        })
                    },
                    ref: "switcher"
                })
            ]),
            h('div', {
                class: "side-panel",
            }, panels)
        ])
    },
    props: ["tucked"],
    data: function() {
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
                const tab = { id: attr("pane"), icon: attr("icon"), elm: pane.elm };
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
        }
    }
};

/**
 * 侧边栏面板
 */
export const MtSidePane = {
    name: "mt-side-pane",
    functional: true,
    render(h, ctx) {
        let c = ctx.data.class instanceof Array ? ctx.data.class : [ctx.data.class];
        return h('div', {
            staticClass: ctx.data.staticClass,
            class: ['side-pane', ctx.props.pane, ...c],
            attrs: ctx.props
        }, [
            h('h3', { class: "header" }, ctx.props.label),
            h('div', { class: "content" }, ctx.slots().default)
        ])
    },
    props: ["label", "icon", "pane"]
}

import { MtIcon } from "./others.js"

/**
 * 标签浏览
 */
export const MtView = {
    name: "mt-view",
    template: /* HTML */`
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
        <div class="__toolBar">
            <slot name="tools"></slot>
            <div v-if="canClose != null"><li></li></div>
        </div>
    </div>
    `,
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
                this.$emit('switch', {});
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
            this.$emit('switch', {});
        }
    },
    components: { MtIcon },
}

/** 列表 */
export const MtList = {
    name: "mt-list",
    template: /* HTML */`
    `,
    props: ["items"],
    data() {
        return {
            chosen: null,
        }
    },
    methods: {
        chose(item, index) {
            this.chosen = index;
            this.$emit("chose", item, index);
        },
    }
}
