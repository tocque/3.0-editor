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
                    <mt-btn v-if="dir.editable" mini
                        @click.stop="addin(item)"
                    >修改</mt-btn>
                    <mt-btn v-if="!dir.const && item.added" class="__delete" mini
                        @click.stop="unaddFile(item)"
                    >移除</mt-btn>
                    <mt-btn v-else-if="!dir.const" class="__add" mini
                        @click.stop="addFile(item)"
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
        this.dirList = game.resource.listDirs();
    },
    methods: {
        async choseDir(dir) {
            if (dir == this.dir) return;
            this.dir = dir;
            const fileList = await game.resource.readDir(dir.name, true);
            const registered = game.resource.getList(dir.name);
            const checked = new Set(registered);
            this.fileList = fileList.map((e) => {
                const file = { name: e, checked: false, icon: ftools.getIcon(e) }
                if (checked.has(e)) {
                    file.added = true;
                    checked.delete(e);
                }
                return file;
            })
            if (checked.size) {
                this.$notify.error("有注册但不存在的文件, 打开控制台以查看文件列表", {
                    source: "文件浏览",
                });
                console.error(`missing Files in /${dir.name}: `, [...checked]);
            }
            this.selectedFile = null;
        },
        async addFile(item) {
            try {
                await game.resource.regFile(this.dir.name, item.name);
                item.added = true;
            } catch (e) { console.log(e) }
        },
        async unaddFile(item) {
            try {
                await game.resource.unRegFile(this.dir.name, item.name);
                item.added = false;
            } catch {}
        },
        choseFile(file) {
            this.optType = "preview";
            this.selectedFile = file;
        },
        addin(file) {
            this.optType = "append";
            this.selectedFile = file;
        }
    },
    components
}