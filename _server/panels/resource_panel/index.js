/**
 * script_panel.js 资源管理界面
 */
import game from "../../editor_game.js"
import { importCSS } from "../../editor_ui.js";
import { ftools } from "../../editor_file.js"

import rescourceAppend from "./rescource_append.js";

let components = {
    rescourceAppend
}

importCSS("./_server/panels/resource_panel/resource_panel.css");

export default {
    label: "资源",
    template: /* HTML */`
    <div id="resourcePanel">
        <div class="left">
            <ul class="__list">
                <li v-for="(item, index) of dirList" :key="index"
                    class="__item" :class="{ chosen: dir == item }"
                    @click="choseDir(item)"
                >
                    <mt-icon :icon="'folder' + (dir == item ? '-opened' : '')"></mt-icon>
                    <span>{{ item.label }}</span>
                    <mt-icon class="mark" icon="chevron-right"></mt-icon>
                </li>
            </ul>
        </div>
        <div class="mid">
            <div class="toolbar">
                <div v-if="dir" :class="{ disabled: dir.opt }">
                    <mt-btn mini>全选</mt-btn>
                    <mt-btn mini>反选</mt-btn>
                </div>
            </div>
            <ul class="__list">
                <li v-for="(item, index) of fileList" :key="index"
                    class="__item" :class="{ chosen: selectedFile == item }"
                    @click="choseFile(item, index)"
                >
                    <mt-icon icon="item.icon"></mt-icon>
                    <span>{{ item.name }}</span>
                    <mt-btn v-if="dir.opt=='append'" mini
                        @click="addin(item)"
                    >追加</mt-btn>
                    <mt-btn v-else-if="!dir.opt && item.added" class="__delete" mini
                        @click="unaddFile(item)"
                    >移除</mt-btn>
                    <mt-btn v-else-if="!dir.opt" class="__add" mini
                        @click="addFile(item)"
                    >添加</mt-btn>
                </li>
            </ul>
        </div>
        <div class="right">
            <keep-alive>
                <div v-if="!selectedFile"></div>
                <resource-append v-else-if="optType == 'append'"
                    :file="selectedFile"
                ></resource-append>
                <mt-previewer v-else-if="optType == 'preview'"
                    :file="selectedFile"
                ></mt-previewer>
            </keep-alive>
        </div>
    </div>
    `,
    data() {
        return {
            dir: null,
            dirList: [],
            selectedFile: null,
            fileList: [],
            optType: null,
        }
    },
    created() {
        this.dirList = game.getResourceFolders();
    },
    methods: {
        async choseDir(dir) {
            if (dir == this.dir) return;
            this.dir = dir;
            const fileList = await game.readResourceDir(dir);
            const registered = game.getResourceList(dir);
            const checked = new Set(registered);
            this.fileList = fileList.map((e) => {
                const file = { name: e, checked: false, icon: ftools.getIcon(e) }
                if (checked.has(e)) {
                    file.added = true;
                    checked.delete(e);
                }
                return file;
            })
            const missing = [...checked];
            if (missing.length) {
                this.$notify.error("有注册但不存在的文件, 打开控制台以查看文件列表", {
                    source: "文件浏览",
                });
                console.error("missing Files in /"+dir.path+ ": " + missing);
            }
            this.selectedFile = null;
        },
        addFile(item) {
            item.added = true;
            this.modifyList();
        },
        unaddFile() {
            item.added = false;
            this.modifyList();
        },
        choseFile(file) {
            this.optType = "preview";
            this.selectedFile = file;
        },
        modifyList() {
            const item = this.dir.path;
            const list = this.fileList.filter(e => e.added).map(e => e.name);
            game.gameData.data.modify({ key: `[main][${item}]`, value: list });
        },
        addin(file) {
            this.optType = "append";
            this.selectedFile = file;
        }
    },
    components
}