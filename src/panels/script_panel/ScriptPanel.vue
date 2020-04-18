<template>
    <div class="main-side-layout" id="scriptPanel">
        <mt-side class="left" :tucked.sync="leftCollapsed">
            <script-tree active ref="scriptTree" @openTab="openTab"></script-tree>
            <plugin-lib @openTab="openTab"></plugin-lib>
        </mt-side>
        <div class="mid" :class="{ expend: leftCollapsed }">
            <mt-view v-show="viewer!='null'" ref="view" canClose
                @switch="switchTab" @close="closeTab"
            ></mt-view>
            <code-editor ref="editor"
                :active="active && viewer=='script'" :shortcut="['save']"
                lang="javascript" @save="saveScript"
            ></code-editor>
            <keep-alive>
                <plugin-detail v-if="viewer=='plugin'" :info="tab.info"></plugin-detail>
            </keep-alive>
            <div v-show="viewer=='null'" class="empty"></div>
        </div>
        <status-item></status-item>
    </div>
</template>

<script>
import game from "../../game.js";

import ScriptTree from "./ScriptTree.vue";
import PluginLib from "./PluginLib.vue";
import PluginDetail from "./PluginDetail.vue";

export default {
    label: "脚本",
    data() {
        return {
            active: false,
            tabs: [],
            viewer: "null",
            tab: null,
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
            this.$refs.view.openTab(tab);
        },
        switchTab(tab) {
            this.tab = tab;
            if (!tab) {
                this.viewer = "null";
            } else {
                this.viewer = tab.type;
            }
            if (this.viewer == "script") {
                this.$nextTick(() => {
                    this.$refs.editor.load(tab);
                });
            }
        },
        async saveScript(node) {
            await this.$refs.scriptTree.saveNode(node);
        },
        async closeTab(tab) {
            if (tab.type == "script") {
                if (tab.editted) {
                    if (confirm("是否保存对"+tab.label+"的编辑?")) {
                        tab.text = tab.model.getValue();
                        await this.saveScript(tab);
                    }
                    tab.model.dispose();
                    delete tab.model;
                }
            }
        }
    },
    components: {
        ScriptTree, PluginLib, PluginDetail
    }
}
</script>

<style lang="less">
#scriptPanel {
    .mid {
        &.expend {
            left: 50px;
        }
        .empty {
            width: 100%;
            height: 100%;
            background-color: var(--c-main);
        }
    }
    /* 优化展开时monaco的layout */
    .monaco-editor {
        width: 100% !important;
        .overflow-guard {
            width: 100% !important;
        }
        .monaco-scrollable-element.editor-scrollable {
            right: 0;
            width: auto !important;
        }
        .minimap.slider-mouseover {
            left: auto !important;
            right: 14px;
            /* transition: width 1s; */
        }
    }
}
</style>