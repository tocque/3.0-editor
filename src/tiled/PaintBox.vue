<template>
    <div class="paintBox">
        <div class="__topbar">
            <div class="icon-btn" @click="toggleFold" 
                title="设置高度"
            >
                <mt-icon icon="fold"></mt-icon>
            </div>
        </div>
        <div ref="ctxContainer" class="tiledImages">
            <div ref="selectBox" v-show="selected" class="selectBox"
                :style="boxStyle"
            ></div>
        </div>
    </div>
</template>

<script>
import { isset, Pos } from "../utils.js"
import game from "../game.js"
import { TilesetsImage, SpritesImage } from "./tiledImages.js";

export default {
    computed: {
        boxStyle() {
            const pos = this.box.pos, grid = this.box.grid;
            return {
                left: pos.x + 'px', top: pos.y + 'px',
                width: grid.x - 6 + 'px', height: grid.y - 6 + 'px'
            }
        }
    },
    data() {
        return {
            scrollBarHeight :0,
            foldPerCol: 50,
            selected: false,
            box: {
                pos: new Pos(),
                grid: new Pos()
            },
            show: 'terrains',
        }
    },
    created() {
        this.selection = {},
        this.foldPerCol = editor.userdata.get('foldPerCol', 50);
        //oncontextmenu = function (e) { e.preventDefault() }
    },
    mounted() {
        this.tileImages = this.initImages();
        this.setTileFold(this.foldPerCol);
    },
    methods: {
        toggleFold() {
            const perCol = parseInt(prompt("请输入折叠素材模式下每列的个数：", "50")) || 0;
            if (perCol > 0) {
                editor.userdata.get('foldPerCol', perCol);
                this.perCol = perCol;
                this.setTileFold(perCol);
            }
        },

        initImages() {
            const createTileImage = (type) => {
                const tileImage = new SpritesImage(() => {
                    return game.resource.getImage(type);
                }, this.onselect.bind(this, name));
                this.$refs.ctxContainer.appendChild(tileImage.ctx.canvas);
                return tileImage;
            }
            const images = [
                "enemys", "items", "events", "autotiles",
            ].map(e => createTileImage(e));
            game.resource.getList('tilesets').forEach((e) => {
                const tilesetsImage = new TilesetsImage(
                    game.resource.getImage('tilesets', e),
                    {
                        ondown: this.ondown,
                        onmove: this.onmove,
                        onup: this.onup,
                    }
                )
                this.$refs.ctxContainer.appendChild(tilesetsImage.ctx.canvas);
                images.push(tilesetsImage);
            });
            return images;
        },

        /**
         * 更新折叠状态
         * @param {Number} [perCol] 每列个数
         */
        setTileFold(perCol = this.foldPerCol) {
            for (let t of this.tileImages) {
                t.update(perCol);
            }
        },

        /**
         * 选择素材的响应函数
         * @param {String} from 来源的素材组
         * @param {Pos} pos 选择素材的左上角位置
         * @param {Pos} grid 选择素材的长宽
         * @param {Number} index 点击素材的编号
         */
        onselect(from, pos, grid, index) {
            this.selected = true;
            this.box.pos.set(pos), this.box.grid.set(grid);
            const [type, name] = from.split(":");
            if (type == "tileset") {
                console.log(pos);
            } else {
                if (type == "terrains") {
                    if (index === 0) { // 特判清除块
                        this.$emit("select", "empty");
                        return;
                    } else index--;
                }
                const block = game.get("data/map/blockByIcon", type, index);
                this.$emit("select",  block);
            }
        },
        selectByIndex() {

        },
    }
}
</script>

<style lang="less">
@w-paint-box: 360px;
.paintBox {
    background-color: #444;
    box-shadow: -3px 0px 3px #111;
    width: @w-paint-box;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    .__topbar {
        background-color: #333;
        display: flex;
        height: 30px;
        .__class {
            display: flex;
            color: var(--c-text);
        }
        .icon-btn {
            margin-left: auto;
            margin-right: 4px;
        }
    }
    .tiledImages {
        top: 30px;
        position: absolute;
        overflow: auto;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: end;
    }
    .selectBox {
        position: absolute;
        z-index: 1;
        border: 1px solid rgb(0, 0, 0);
        margin: 3px 0px 0px 3px;
        padding: 0px;
        box-sizing: border-box;
        box-shadow: rgb(255, 255, 255) 0px 0px 0px 2px, rgb(0, 0, 0) 0px 0px 0px 3px;
    }
}
</style>