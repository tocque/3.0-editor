import { isset, Pos } from "../editor_util.js";
import game from "../editor_game.js";
import serviceManager from "../editor_service.js";

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
            this.exchangePos(editor.pos, this.lastRightButtonPos[1]);
        },
    }
})

class Line {
    /** @type {Array<Pos>} */stepPostfix = [];
    constructor(h) {
        this.$host = h;
        h.commandStack.register("line", (data, createRes) => {
            const layer = data.layer;
            if (createRes) {
                data.preData = [];
                for (let pos of data.route) {
                    data.preData.push(h.blockAt(pos, layer));
                    h.setBlock(pos, data.block, layer);
                }
                return data;
            } else {
                for (let pos of data.route) {
                    h.setBlock(pos, data.block, layer);
                }
            }
        }, ({route, preData, layer}) => {
            route.forEach((pos, i) => {
                h.setBlock(pos, preData[i], layer);
            })
        });
    }
    start(pos) {
        this.stepPostfix = [pos];
        this.$host.setPreviewer(this.preview.bind(this));
        this.$host.updateMap();
    }
    clear() {
        this.$host.clearPreviewer();
        this.stepPostfix = [];
    }
    move(pos) {
        if (this.stepPostfix.some(e => e.equal(pos))) return;
        this.stepPostfix.push(pos);
        this.$host.updateMap();
    }
    draw() {
        this.$host.clearPreviewer();
        this.$host.do("line", {
            route: this.stepPostfix.map(e => e.copy()), 
            block: this.$host.selectedBlock.number,
            layer: this.$host.layerMod
        });
    }
    preview(map) {
        const layer = this.$host.layerMod;
        if (game.map.isEmpty(map[layer])) {
            map[layer] = game.map.createEmetyArray(map.width, map.height);
        } else map[layer] = game.map.cloneMapArray(map[layer]);
        for (let pos of this.stepPostfix) {
            map[layer][pos.y][pos.x] = this.$host.selectedBlock.number;
        }
        return map;
    }
}

class Rectangle {
    startPos;
    constructor(h) {
        this.$host = h;
        h.commandStack.register("rectangle", (data, createRes) => {
            const layer = data.layer;
            if (createRes) {
                data.preData = [];
                const i = new Pos(data.start);
                for (; i.y <= data.end.y; i.y++) {
                    data.preData[i.y-data.start.y] = [];
                    for (; i.x <= data.end.x; i.x++) {
                        data.preData[i.y-data.start.y].push(h.blockAt(i, layer));
                        h.setBlock(i, data.block, layer);
                    }
                    i.x = data.start.x;
                }
                console.log(data);
                return data;
            } else {
                for (let i = data.start.y; i <= data.end.y; i++) {
                    for (let j = data.start.x; j <= data.end.x; j++) {
                        h.setBlock(new Pos(j, i), data.block, layer);
                    }
                }
            }
        }, ({start, end, layer, preData}) => {
            const { x: sx, y: sy } = start;
            for (let i = sy; i <= end.y; i++) {
                for (let j = sx; j <= end.x; j++) {
                    h.setBlock(new Pos(j, i), preData[i-sy][j-sx], layer);
                }
            }
        });
    }
    start(pos) {
        this.startPos = this.nowPos = pos;
        this.$host.setPreviewer(this.preview.bind(this));
        this.$host.updateMap();
    }
    clear() {
        this.$host.clearPreviewer();
        this.startPos = null;
        this.nowPos = null;
    }
    move(pos) {
        this.nowPos = pos;
        this.$host.updateMap();
    }
    draw(pos) {
        this.$host.clearPreviewer();
        const [start, end] = this.getLTRB(this.startPos, pos);
        this.$host.do("rectangle", {
            start, end,
            block: this.$host.selectedBlock.number,
            layer: this.$host.layerMod
        });
    }
    preview(map) {
        const layer = this.$host.layerMod;
        if (game.map.isEmpty(map[layer])) {
            map[layer] = game.map.createEmetyArray(map.width, map.height);
        } else map[layer] = game.map.cloneMapArray(map[layer]);
        const [start, end] = this.getLTRB(this.startPos, this.nowPos);
        for (let i = start.y; i <= end.y; i++) {
            for (let j = start.x; j <= end.x; j++) {
                map[layer][i][j] = this.$host.selectedBlock.number;
            }
        }
        return map;
    }
    getLTRB({ x: sx, y: sy }, { x: dx, y: dy }) {
        if (sx > dx) [sx, dx] = [dx, sx];
        if (sy > dy) [sy, dy] = [dy, sy];
        return [new Pos(sx, sy), new Pos(dx, dy)];
    }
}

class Fill {
    constructor(h) {
        this.$host = h;
        h.commandStack.register("fill", (data, createRes) => {
            const layer = data.layer;
            if (createRes) {
                data.preData = [];
                const i = new Pos(data.start);
                for (; i.y < data.end.y; i.y++) {
                    data.preData[i.y] = [];
                    for (; i.x < data.end.x; i.x++) {
                        data.preData.push(h.blockAt(i, layer));
                        h.setBlock(i, data.block, layer);
                    }
                }
                console.log(data);
                return data;
            } else {
                for (let i = data.start.y; i < data.end.y; i++) {
                    for (let j = data.start.x; j < data.end.x; j++) {
                        h.setBlock(new Pos(j, i), data.block, layer);
                    }
                }
            }
        }, (data) => {
            data.route.forEach((pos, i) => {
                h.setBlock(pos, data.preData[i], layer);
            })
        });
    }
    start(pos) {
        this.startPos = this.nowPos = pos;
        this.$host.setPreviewer(this.preview.bind(this));
        this.$host.updateMap();
    }
    clear() {
        this.$host.clearPreviewer();
        this.startPos = null;
        this.nowPos = null;
    }
    move(pos) {
        this.nowPos = pos;
        this.$host.updateMap();
    }
    draw(pos) {
        this.$host.clearPreviewer();
        const [start, end] = this.getLTRB(this.startPos, pos);
        this.$host.do("rectangle", {
            start, end,
            block: this.$host.selectedBlock.number,
            layer: this.$host.layerMod
        });
    }
    getLTRB({ x: sx, y: sy }, { x: dx, y: dy }) {
        if (sx > dx) [sx, dx] = [dx, sx];
        if (sy > dy) [sy, dy] = [dy, sy];
        return [new Pos(sx, sy), new Pos(dx, dy)];
    }
}

serviceManager.register('tiledEditor', 'paint', {
    data: {
        mouseOut: true,
        ondraw: false,
        lastpos: null,
        modes: {},
    },
    mounted(h) {
        this.modes = {
            line: new Line(h),
            rectangle: new Rectangle(h),
            fill: new Fill(h)
        }
        h.$registerMode("paint", {
            label: "绘制地图",
            event: {
                ondown: (pos) => {
                    this.modes[h.brushMod].start(pos);
                    this.ondraw = true;
                    this.lastpos = pos;
                },
                onout: () => {
                    setTimeout(() => {
                        if (!this.mouseOut) return;
                        this.modes[h.brushMod].clear();
                        this.ondraw = false;
                    }, 1000)
                    this.mouseOut = true;
                },
                onmove: (pos) => {
                    if (!this.ondraw) return;
                    this.mouseOut = false;
                    if (this.lastpos.equal(pos)) return;
                    this.lastpos = pos;
                    this.modes[h.brushMod].move(pos);
                },
                onup: (pos) => {
                    this.modes[h.brushMod].draw(pos);
                    this.modes[h.brushMod].clear();
                    this.ondraw = false;
                }
            }
        })
    }
});