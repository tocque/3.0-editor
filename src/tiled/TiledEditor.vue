<template>
    <div class="tileEditor">
        <div class="topbar">
            <mt-view ref="layer" @switch="changeLayer">
                <template slot="tools">
                    <div title="锁定模式" @click="switchLock" class="icon-btn">
                        <mt-icon :icon="lockMode ? 'lock' : 'unlock'"></mt-icon>
                    </div>
                    <span class="__toolGroup">
                        <div v-for="(brush, index) of brushs" :key="index"
                            class="icon-btn"
                            :class="{ active: brushMod == brush.name && 
                                sys_mainEditor__.mode.name == 'paint'}"
                            :title="brush.title" @click="changeBrush(brush.name)"
                        >
                            <mt-icon :icon="brush.icon"></mt-icon>
                        </div>
                    </span>
                    <div title="保存地图 (ctrl+s)" @click="saveMap" class="icon-btn"
                        :class="editted ? 'active' : 'unactive'"
                    >
                        <mt-icon icon="save"></mt-icon>
                    </div>
                </template>
            </mt-view>
        </div>
        <marked-container :size="mapSize" class="mapEdit" :class="{ expend: dockTucked }">
            <canvas 
                class='uiCanvas' ref="eui" 
                width='416' height='416' 
                style='z-index:100'
                @mousedown="onmousedown"
                @mousemove="onmousemove"
                @mouseup="onmouseup"
                @dblclick="selectIcon"
                @contextmenu="openMenu"
            ></canvas>
        </marked-container>
        <div class="mt-dock" role="complementary" :class="{ tucked: dockTucked }">
            <div class="mt-dock__title">
                <div class="mt-dock__item active"><a>最近使用图块</a></div>
                <div class="mt-dock__toolbar">
                    <mt-icon :icon="dockTucked ? 'chevron-up' : 'chevron-down'" 
                        @click="toggleDock" :title="dockTucked ? '展开' : '折叠'" 
                    ></mt-icon>
                </div>
            </div>
            <div class="mt-dock__content">
                <last-used-blocks></last-used-blocks>
            </div>
        </div>
        <paint-box ref="paintBox" @select="onselectBlock"></paint-box>
        <context-menu ref="contextmenu"></context-menu>
        <status-item v-if="$parent.active">{{ (sys_mainEditor__.mode||{}).label }}</status-item>
    </div>
</template>

<script>
import game from "../game.js";
import { Pos, CommandStack, exec, batchMixin } from "../utils.js";
import $ from "../mt-ui/canvas.js";

import PaintBox from "./PaintBox.vue";
import LastUsedBlocks from "./LastUsedBlocks.vue";
import MarkedContainer from "./widgets/MarkedContainer.vue";
import serviceManager from "../service.js";
import "./service/clipboard.js";
import "./service/paint.js";

let components = {
    PaintBox, LastUsedBlocks, MarkedContainer,
}

const brushs = [
    {
        name: "line",
        icon: "pen",
        title:"画线"
    },
    {
        name: "rectangle",
        icon: "rectangle",
        title:"画矩形"
    },
    {
        name: "fill",
        icon: "paintcan",
        title:"填充"
    },
]

const layerDict = {
    "fgmap": {
        name: "前景层",
        alpha: [0.3, 0.3, 1],
    },
    "map": {
        name: "事件层",
        alpha: [1, 1, 1],
    },
    "bgmap": {
        name: "背景层",
        alpha: [1, 0.3, 0.3],
    }
}

export default /** @mixes mainEditorExtension */{
    name: "tiled-editor",
    extends: serviceManager.mainEditorExtension,
    props: ["map"],
    data() {
        return {
            pos: new Pos,
            brushMod: "line", // ["line", "rectangle", "fill"]
            brushs,
            layerMod: "map", // ["fgmap", "map", "bgmap"]
            // 锁定模式
            lockMode: false,
            mapSize: [0, 0],
            dockTucked: false,
            mapid: "",
            selectedBlock: {},
            editted: false,
        }
    },
    created() {
        this.commandStack = new CommandStack(30);
        this.ready = new Promise(res => {
            this.__resolver__ = () => res(this);
        })
    },
    async mounted() {
        editor.tiledEditor = this;
        this.app = await game.get("scene", "map");
        this.gameCanvas = this.app.view;
        this.$refs.eui.parentElement.insertBefore(this.app.view, this.$refs.eui);
        this.eui = $(this.$refs.eui);
        this.previewer = null;
        this.$refs.contextmenu.inject([
            {
                text: (e, h, pos) => `编辑此点(${pos.format(",")})`,
                action(e, h, pos) {
                    h.$changeMode("event");
                    // h.drawPosSelection(pos);
                    h.$emit("selectPos", pos);
                },
            },
            {
                text: "在素材区选中此图块", 
                action: (e, h, pos) => {
                    this.$refs.paintBox.selectById(h.getLayer().blockAt(pos));
                }
            },
            {
                text: "撤销", 
                validate: (e, h) => h.commandStack.hasBack(),
                action: (e, h) => {h.undo()}
            },
            {
                text: "重做", 
                validate: (e, h) => h.commandStack.hasNext(),
                action: (e, h) => {h.redo()}
            },
            {
                text: "仅清空此点事件", 
                action: (e, h, pos) => {h.clearPos(pos, false)}
            },
            {
                text: "清空此点及事件", 
                action: (e, h, pos) => {h.clearPos(pos, true)}
            },
        ]);
        this.$regShortcut(batchMixin({
            "z.ctrl": { action: () => this.undo() },
            "y.ctrl": { action: () => this.redo() },
            "s.ctrl": { action: () => this.saveMap() },
        }, { condition: () => this.$parent.active }));
        this.commandStack.register("setBlock", );
        this.$registerMode("event", {
            label: "事件编辑",
            event: {
                ondown: (pos) => this.$emit("selectPos", pos),
            }
        });
        this.$work("tiledEditor", "event");
        this.registerBadge();
        this.__resolver__();
    },
    methods: {
        //////////// 接口函数 ////////////
        openMap(floorId) {
            const width = game.maps[floorId].query("width");
            const height = game.maps[floorId].query("height");
            this.mapid = floorId;
            this.resize(width, height);
            this.mapSize = [width, height];
            game.map.changeFloor(floorId).then(() => {
                this.updateMap();
            });
            const layers = ["bgmap", "map", "fgmap"].map((e) => {
                return { type: "tile", id: e, label: layerDict[e].name }
            })
            this.$refs.layer.init(layers);
            this.$refs.layer.openTabByKey("tilemap");
        },

        switchLock() {
            this.lockMode = !this.lockMode;
            if (this.lockMode) {
                this.$print('锁定模式开启时点击空白处将不再自动保存，请谨慎操作。');
            }
        },

        changeBrush(mode) {
            this.brushMod = mode;
            // this.$changeMode("paint");
        },

        changeLayer(layer) {
            this.layerMod = layer.id;
            ["bg", "event", "fg"].forEach((e, i) => {
                this.app.layersTable[e].alpha = layerDict[layer.id].alpha[i];
            })
        },

        do(command, data) {
            this.commandStack.push(command, data);
            this.updateMap();
        },

        redo() {
            if (!this.commandStack.hasNext()) return false;
            this.commandStack.redo();
            this.updateMap();
        },

        undo() {
            if (!this.commandStack.hasBack()) return false;
            console.log(this.commandStack);
            this.commandStack.undo();
            this.updateMap();
        },

        updateMap() {
            if (this.previewer) {
                const map = Object.assign({}, this.map);
                game.map.updateMap(this.previewer(map));
            } else game.map.updateMap(this.map);
        },

        setPreviewer(previewer) {
            this.previewer = previewer;
        },

        clearPreviewer() {
            this.previewer = null;
        },

        //////////// 工具函数 ////////////

        blockAt(pos, layer = "map") {
            return this.map[layer]?.[pos.y]?.[pos.x] || 0;
        },

        setBlock(pos, number, layer = "map") {
            if (game.map.isEmpty(this.map[layer])) {
                this.map[layer] = game.map.createEmetyArray(this.map.height, this.map.width);
            }
            this.map[layer][pos.y][pos.x] = number;
        },


        /**
         * 由点击事件获得地图位置
         */
        eToPos: function (e) {
            const size = 32;
            return new Pos(e.layerX, e.layerY).gridding(size);
        },

        //////////// 绘制函数 ////////////

        // drawSelectBox() {
        //     var fg = this.dom.efgCtx;
        //     fg.strokeStyle = 'rgba(255,255,255,0.7)';
        //     fg.lineWidth = 4;
        //     fg.strokeRect(32*editor.pos.x - core.bigmap.offsetX + 4, 32*editor.pos.y - core.bigmap.offsetY + 4, 24, 24);
        // },

        registerBadge() {

        },

        updateBadges() {

        },

        // drawEventBlock() {
        //     let fg = this.dom.efg, fgctx = this.dom.efgCtx;
        
        //     fgctx.clearRect(0, 0, fg.width, fg.height);
        //     var firstData = editor.game.getFirstData();
        //     for (var i=0;i<core.__SIZE__;i++) {
        //         for (var j=0;j<core.__SIZE__;j++) {
        //             var color=[];
        //             var loc=(i+core.bigmap.offsetX/32)+","+(j+core.bigmap.offsetY/32);
        //             if (editor.currentFloorId == firstData.floorId
        //                 && loc == firstData.hero.loc.x + "," + firstData.hero.loc.y) {
        //                 fg.textAlign = 'center';
        //                 editor.game.doCoreFunc('fillBoldText', fg, 'S',
        //                     32 * i + 16, 32 * j + 28, '#FFFFFF', 'bold 30px Verdana');
        //             }
        //             if (editor.currentFloorData.events[loc])
        //                 color.push('#FF0000');
        //             if (editor.currentFloorData.autoEvent[loc]) {
        //                 var x = editor.currentFloorData.autoEvent[loc];
        //                 for (var index in x) {
        //                     if (x[index] && x[index].data) {
        //                         color.push('#FFA500');
        //                         break;
        //                     }
        //                 }
        //             }
        //             if (editor.currentFloorData.afterBattle[loc])
        //                 color.push('#FFFF00');
        //             if (editor.currentFloorData.changeFloor[loc])
        //                 color.push('#00FF00');
        //             if (editor.currentFloorData.afterGetItem[loc])
        //                 color.push('#00FFFF');
        //             if (editor.currentFloorData.cannotMove[loc])
        //                 color.push('#0000FF');
        //             if (editor.currentFloorData.afterOpenDoor[loc])
        //                 color.push('#FF00FF');
        //             for(var kk=0,cc;cc=color[kk];kk++){
        //                 fg.fillStyle = cc;
        //                 fg.fillRect(32*i+8*kk, 32*j+32-8, 8, 8);
        //             }
        //             var index = this.bindSpecialDoor.enemys.indexOf(loc);
        //             if (index >= 0) {
        //                 fg.textAlign = 'right';
        //                 editor.game.doCoreFunc("fillBoldText", fg, index + 1,
        //                     32 * i + 28, 32 * j + 15, '#FF7F00', '14px Verdana');
        //             }
        //         }
        //     }
        // },

        resize(width, height) {
            width *= 32, height *= 32;
            this.app.renderer.resize(width, height);
            this.app.view.style.width = width + "px";
            this.app.view.style.height = height + "px";
            this.eui.resize(width, height);
            this.eui.setting("style", { width, height });
        },

        /**
         * 在绘图区格子内画一个随机色块
         */
        // fillPos: function (pos) {
        //     this.dom.euiCtx.fillStyle = '#' + ~~(Math.random() * 8) + ~~(Math.random() * 8) + ~~(Math.random() * 8);
        //     this.dom.euiCtx.fillRect(pos.x * 32 + 12 - core.bigmap.offsetX, pos.y * 32 + 12 - core.bigmap.offsetY, 8, 8);
        // },

        
        //////////// 内置功能 ////////////

        /**
         * this.dom.eui.ondblclick
         * 双击地图可以选中素材
         */
        selectIcon: function (e) {
            const pos = this.eToPos(e);
            // editor.setSelectBoxFromInfo(editor[editor.layerMod][pos.y][pos.x]);
            return;
        },

        /**
         * this.dom.eui.onmousedown
         * + 绑定机关门事件的选择怪物
         * + 右键进入菜单
         * + 非绘图时选中
         * + 绘图时画个矩形在那个位置
         * @param {MouseEvent} e
         */
        onmousedown(e) {
            if (e.button == 2) return;
            const pos = this.eToPos(e);
            this.$trigger("ondown", pos);
            return false;
        },

        /**
         * this.dom.eui.onmousemove
         * + 非绘图模式时维护起止位置并画箭头
         * + 绘图模式时找到与队列尾相邻的鼠标方向的点画个矩形
         */
        onmousemove(e) {
            const pos = this.eToPos(e);
            this.$trigger("onmove", pos);
        },

        /**
         * this.dom.eui.onmouseup
         * + 非绘图模式时, 交换首末点的内容
         * + 绘图模式时, 根据画线/画矩形/画tileset 做对应的绘制
         */
        onmouseup(e) {
            const pos = this.eToPos(e);
            this.$trigger("onup", pos);
            return;
        },

        openMenu(e) {
            this.$trigger('beforeConextMenu');
            this.$refs.contextmenu.open(e, this.eToPos(e));
        },

        // selectFloor_func: function () {
        //     var selectFloor = document.getElementById('selectFloor');
        //     editor.game.getFloorFileList(function (floors) {
        //         var outstr = [];
        //         floors[0].forEach(function (floor) {
        //             outstr.push(["<option value='", floor, "'>", floor, '</option>\n'].join(''));
        //         });
        //         selectFloor.innerHTML = outstr.join('');
        //         selectFloor.value = core.status.floorId;
        //         selectFloor.onchange = function () {
        //             editor_mode.onmode('nextChange');
        //             editor_mode.onmode('floor');
        //             editor.changeFloor(selectFloor.value);
        //         }
        //     });
        // }

        onselectBlock(block) {
            if (block == "empty") return;
            this.$emit("selectBlock", block);
            this.selectedBlock = block;
            this.$changeMode("paint");
        },

        saveMap() {
            this.$emit("save", [this.map.bgmap, this.map.map, this.map.fgmap]);
        },

        toggleDock() {
            this.dockTucked = !this.dockTucked;
        },
    },
    components,
}
</script>

<style lang="less">
@w-paint-box: 360px;
@h-dock: 135px;
.tileEditor {
    height: 100%;
    width: 100%;
    background: #0e0e0e;
    &>.topbar {
        position: absolute;
        left: 0px;
        right: @w-paint-box;
        height: 35px;
        .__toolGroup {
            .active i.codicon {
                color: var(--c-text-hl);
            } 
        }
    }
    .mt-dock {
        position: absolute;
        bottom: 0;
        right: @w-paint-box;
        left: 0;
        height: @h-dock;
        border-top: 1px solid #666666;
        &.tucked {
            height: 35px;
            .__content {
                display: none;
            }
        }
        &__title {
            display: flex;
            height: 35px;
        }
        &__item {
            a {
                font-size: 14px;
                padding: 6px 0;
                line-height: 34px;
                color: var(--c-text);
                white-space: nowrap;
            }
            &.active {
                a {
                    border-bottom: 1px solid white;
                }
                color: var(--c-text-hl);
            }
            &:first-child {
                padding-left: 12px;
            }
        }
        &__toolbar {
            padding: 0 10px;
            display: flex;
            align-items: center;
            margin-left: auto;
        }
        &__content {
            height: -webkit-fill-available;
        }
    }
    .mapEdit {
        position: absolute;
        top: 35px;
        right: @w-paint-box;
        left: 0;
        bottom: @h-dock;
        overflow: hidden;
        .uiCanvas {
            position: absolute;
        }
    }
}
</style>