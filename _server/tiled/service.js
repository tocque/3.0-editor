editor.service.register('tiledEditor', 'Clipboard', {
    data: {
        block: null,
        events: null,
        pos: null,
    },
    mounted(h) {
        var _this = this;
        h.$refs.contextmenu.inject([
            {
                text: "复制事件",
                action: (e, h) => _this.store(h.pos),
            },
            {
                text: "剪切事件",
                action: (e, h) => {
                    _this.store(h.pos);
                    h.clearPos(h.pos);
                }
            },
            {
                text: (e, h) => `粘贴事件(${_this.pos.x}, ${_this.pos.y})到此处`,
                vaildate: (e, h) => !_this.pos.equal(h.pos) && _this.clipboard,
                action: function (e, h) {
                    editor.savePreMap();
                    editor_mode.onmode('');
                    editor.pasteToPos(editor.uivalues.lastCopyedInfo[1]);
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
                text: (e, h) => `交换事件${h.pos.format(",")}与此事件的位置`,
            },
        ], 'group');
    },
    methods: {
        store(pos) {
            var fields = Object.keys(editor.file.comment._data.floors._data.loc._data);
            this.block = core.clone(this.$host.blockAt(pos));
            this.events = {};
            this.pos = pos.copy();
            let events = this.events;
            fields.forEach(function(v) {
                events[v] = core.clone(editor.currentFloorData[v][pos.format(",")]);
            })
        },
        pasteTo(pos) {
            var fields = Object.keys(editor.file.comment._data.floors._data.loc._data);
            this.$host.blockAt(pos) = core.clone(this.map);
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
            this.exchangePos(editor.pos, editor.uivalues.lastRightButtonPos[1]);
        },
    }
})