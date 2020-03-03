/**
 * data_panel.js 数据编辑界面
 */

import commoneventTree from "./commonevent_tree.js";

let components = {
    commoneventTree
}

export default {
    label: "数据",
    template: /* HTML */`
    <div class="main-side-layout" id="dataPanel">
        <mt-side class="left" @toggle="e => leftCollapsed = e">
            <commonevent-tree active ref="commoneventTree" @openTab="openTab"></commonevent-tree>
        </mt-side>
        <status-item></status-item>
    </div>
    `,
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
    components,
}
