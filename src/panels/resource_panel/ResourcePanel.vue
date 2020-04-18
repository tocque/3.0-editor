<template>
    <div id="resourcePanel">
        <div class="left">
            <mt-tabs :tabs="typeList" @switch="choseType">
                <template #tab="{ tab }">
                    <mt-icon :icon="'folder' + (type == tab.name ? '-opened' : '')"></mt-icon>
                    <span>{{ tab.label }}</span>
                    <mt-icon class="mark" icon="chevron-right"></mt-icon>
                </template>
            </mt-tabs>
        </div>
        <div class="mid">
            <!-- 暂时放弃 <div class="toolbar">
                <div v-if="type">
                    <mt-btn mini @click="regAllFile">全选</mt-btn>
                    <mt-btn mini @click="unregAllFile">清空</mt-btn>
                </div>
            </div> -->
            <el-tree v-if="type" ref="fileTree"
                :data="fileTree" :basePadding="15"
                show-checkbox node-key="path"
                @node-click="handleNodeClick"
                @check-change="handleCheckChange"
            >
                <span 
                    class="fileTree-item"
                    slot-scope="{ data }" 
                    :title="data.path"
                >
                    <mt-icon :icon="data.icon"></mt-icon>
                    {{ data.name }}
                </span>
            </el-tree>
        </div>
        <div class="right">
            <div v-show="!selectedFile"></div>
            <keep-alive>
                <mt-image-previewer 
                    v-if="selectedFile && fileType=='image'" 
                    :file="selectedFilePath"
                ></mt-image-previewer>
            </keep-alive>
        </div>
        <status-item v-show="active" 
            @trigger="openFolder(type)" title="打开文件夹"
        >{{ type }}</status-item>
        <status-item v-show="active">{{ selectedFile }}</status-item>
    </div>
</template>

<script>
import game from "../../game.js"
const { shell } = require("electron").remote;

export default {
    label: "资源",
    data() {
        return {
            active: true,
            type: "",
            typeList: [],
            selectedFile: "",
            fileTree: [],
        }
    },
    computed: {
        selectedFilePath() {
            return game.src + `/project/${this.type}/` + this.selectedFile
        }
    },
    created() {
        this.typeList = game.get("resource/typeList");
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    methods: {
        async choseType({ name: type, type: fileType }) {
            if (type === this.type) return;
            this.type = type;
            this.fileType = fileType;
            const { 
                fileTree, 
                checked, 
                missing 
            } = await game.fetch(`resource/${type}/tree`);
            if (missing.length) {
                this.$notify.error("有注册但不存在的文件, 打开控制台以查看文件列表", {
                    source: "文件浏览",
                });
                console.error(`missing Files in ${type}/: `, missing);
            }
            this.fileTree = fileTree;
            this.$refs.fileTree.setCheckedKeys(checked);
            this.selectedFile = "";
        },
        async regFile(item) {
            try {
                await game.post(`resource/${this.type}/reg`, item.path);
                this.$refs.fileTree.setChecked(item.path, true);
            } catch (e) { console.log(e) }
        },
        async unregFile(item) {
            try {
                await game.post(`resource/${this.type}/unreg`, item.path);
                this.$refs.fileTree.setChecked(item.path, false);
            } catch (e) { console.log(e) }
        },
        async regAllFile() {
            try {
                const total = await game.post(`resource/${this.type}/regall`);
                this.$refs.fileTree.setCheckedKeys(total);
            } catch (e) { console.log(e) }
        },
        async unregAllFile() {
            try {
                const total = await game.post(`resource/${this.type}/regall`);
                this.$refs.fileTree.setCheckedKeys(total);
            } catch (e) { console.log(e) }
        },
        handleNodeClick(item, node) {
            if (!node.isLeaf) return;
            this.selectedFile = item.path;
        },
        async handleCheckChange(item, checked) {
            if (checked) {
                await this.regFile(item);
            } else {
                await this.unregFile(item);
            }
            console.log(arguments);
        },
        openFolder(type) {
            console.log(type);
            shell.openItem(game.src + `/project/${type}/`);
        }
    },
    components: {

    }
}
</script>

<style lang="less">
#resourcePanel {
    .left {
        width: 180px;
        padding-top: 20px;
        background-color: var(--c-side);
    }
    .mid {
        left: 180px;
        width: 260px;
        background-color: var(--c-left);
    }
    .right {
        left: 440px;
        background-color: var(--c-main);
    }
    .mt-tabs {
        color: var(--c-text);
        .mt-tab {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            &.active, &:hover {
                color: var(--c-text-hl);
            }
            &.active {
                background-color: var(--c-left);
                font-weight: bold;
            }
            span {
                margin-left: 3px;
            }
        }
        .mark {
            margin-left: auto;
        }
    }
    .fileTree-item {
        margin-left: 2px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .toolbar {
        background: #2E2E2E;
        padding: 10px 10px 5px;
        height: 24px;
        &>div {
            padding-left: 100px;
        }
        .disabled button{
            background: #444;
            color: #888;
        }
    }
    .mt-image-previewer {
        height: 100%;
        width: 100%;
    }
}
</style>