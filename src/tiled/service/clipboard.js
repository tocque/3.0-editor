import { isset, Pos } from "../../utils.js";
import game from "../../game.js";
import serviceManager from "../../service.js";

serviceManager.register('tiledEditor', 'clipboard', {
    data: {
        block: null,
        events: null,
        pos: null,
    },
    mounted(h) {
        h.$refs.contextmenu.inject([
            {
                text: "复制事件",
                action: (e, h, pos) => this.store(pos),
            },
            {
                text: "剪切事件",
                action: (e, h, pos) => {
                    this.store(pos);
                    h.clearPos(pos);
                }
            },
            {
                condition: () => isset(this.pos),
                text: (e, h) => `粘贴事件(${this.pos.format(", ")})到此处`,
                validate: (e, h, pos) => !this.pos.equal(pos) && this.clipboard,
                action: function (e, h) {
                    editor.savePreMap();
                    editor_mode.onmode('');
                    editor.pasteToPos(this.lastCopyedInfo[1]);
                    editor.updateMap();
                    editor.file.saveFloorFile(function (err) {
                        if (err) {
                            printe(err);
                            throw (err)
                        };
                        printf('复制事件成功');
                        editor.tiledEditor.drawPosSelection();
                    });
                },
            },
            {
                condition: () => h.pos,
                text: (e, h) => `交换事件(${h.pos.format(", ")})与此事件的位置`,
            },
        ], { group: "clipboard@1" });
    },
    methods: {
        store(pos) {
        },
        pasteTo(pos) {
            var fields = Object.keys(editor.file.comment._data.floors._data.loc._data);
            //this.$host.blockAt(pos) = core.clone(this.map);
            let events = this.events;
            fields.forEach(function(v) {
                if (events[v] == null) delete editor.currentFloorData[v][pos.format(",")];
                else editor.currentFloorData[v][pos.format(",")] = core.clone(info.events[v]);
            });
        },

        /**
         * this.dom.moveLoc.onmousedown
         * 菜单 移动此事件
         */
        moveLoc_click: function (e) {
            editor.savePreMap();
            editor_mode.onmode('');
            this.exchangePos(editor.pos, this.lastRightButtonPos[1]);
        },
    }
})