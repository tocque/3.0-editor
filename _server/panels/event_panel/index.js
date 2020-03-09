/**
 * event_panel.js 事件编辑界面
 */

import commoneventTree from "./commonevent_tree.js";

let components = {
    commoneventTree
}

export default {
    label: "公共事件",
    template: /* HTML */`
    <div class="main-side-layout" id="commoneventPanel">
        <mt-side class="left" :tucked.sync="leftCollapsed">
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
