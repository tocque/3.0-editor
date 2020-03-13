import { $ } from "../mt-ui/canvas.js"
import { isset, Pos } from "../editor_util.js"
import game from "../editor_game.js"

const imgNames = [
    "terrains", "animates", "enemys", "enemy48", "items", "npcs", "npc48", "autotiles"
];
const tileConfigs = {
    "terrains": {
        offset: 1,
    },
    "animates": {
        grid: 4,
    },
    "enemys": {
        grid: 2,
    },
    "enemy48": {
        grid: 4,
        height: 48,
    },
    "npcs": {
        grid: 2,
    },
    "npc48": {
        grid: 4,
        height: 48,
    },
    "autotiles": {
        grid: [3, 4],
        imageArray: true
    },
    "tilesets": {
        drawRect: true,
        nowrap: true,
    }
}

class TileImage {
    /**
     * Creates an instance of tileImage.
     * @param {Function} datasource
     * @param {Object} config
     * @param {Function} onclick
     * @memberof tileImage
     */
    constructor(datasource, config, onselect) {
        this.ctx = $({ style: { position: "relative" }});
        config = Object.assign({
            width: 32, height: 32, grid: [1, 1], offset: 0
        }, config);
        if (!Array.isArray(config.grid)) config.grid = [config.grid, 1];
        this.config = config;
        this.datasource = datasource;
        if (config.drawRect) {
            this.setRectListener(onselect);
        } else {
            this.setClickListener(onselect);
        }
    }

    getGrid() {
        const config = this.config;
        const grid = config.folded ? [1, 1] : config.grid;
        return [config.width * grid[0], config.height * grid[1]];
    }

    getSize() {
        const config = this.config, image = this.image;
        let oriCol, oriRow;
        if (config.imageArray) {
            oriCol = 1, oriRow = image.length;
        } else {
            oriCol = image.width / config.grid[0] / config.width;
            oriRow = image.height / config.grid[1] / config.height;
        }
        let col = oriCol, row = oriRow + config.offset;
        if (config.folded && !config.nowrap) {
            if (row > config.perCol) {
                col = Math.ceil(row / config.perCol);
                row = config.perCol;
            }
        }
        return [oriCol, oriRow, col, row]
    }

    setClickListener(fn) {
        const cv = this.ctx.canvas;
        cv.addEventListener("click", (e) => {
            const [w, h] = this.getGrid();
            const pos = new Pos(e.layerX, e.layerY).gridding(w, h);
            const grid = new Pos(this.config.width, this.config.height);
            const [oriCol, oriRow, col, row] = this.getSize();
            const colnow = Math.floor(pos.x / oriCol);
            const index = (colnow * row + pos.y) * oriCol + pos.x % oriCol;
            if (index >= oriCol * oriRow + this.config.offset) return;
            fn(pos.mutli(w, h).add(cv.offsetLeft, cv.offsetTop), grid, index);
        });
    }

    setRectListener(fn) {
        const cv = this.ctx.canvas;
        cv.addEventListener("mousedown", (e) => {
            const [w, h] = this.getGrid();
            const pos = new Pos(e.layerX, e.layerY).gridding(w, h).mutli(w, h)
                .add(cv.offsetLeft, cv.offsetTop);
            const grid = new Pos(this.config.width, this.config.height);
            fn(pos, grid);
        });
    }

    update(folded, perCol) {
        const config = this.config;
        if (isset(folded)) config.folded = folded;
        if (isset(perCol)) config.perCol = perCol;
        this.image = this.datasource();
        const [w, h] = this.getGrid();
        const [oriCol, oriRow, col, row] = this.getSize();

        this.ctx.resize(col*w, row*h);
        this.ctx.setting("style", { width: col*w, height: row*h });

        // 绘制
        if (config.imageArray) {
            for (let i = 0; i < oriRow; i++) {
                this.ctx.ctx.drawImage(this.image[i], 0, 0, w, h, 0, i*h, w, h);
            }
        } else {
            const total = oriCol * oriRow;
            for (let i = 0, cnt = 0; i < col; i++) {
                const sh = Math.min(total-cnt, row)*h, sy = Math.max(config.offset-cnt, 0)*h;
                this.ctx.ctx.drawImage(this.image, 0, cnt*h, oriCol*w, sh, i*w, sy, oriCol*w, sh);
                cnt += row;
            }
        }
    }
}

export default {
    template: /* HTML */`
    <div class="paintBox">
        <div class="__topbar">
            <div class="icon-btn" @click="toggleFold" 
                :title="folded ? '展开素材' : '折叠素材'"
            >
                <mt-icon :icon="folded ? 'unfold' : 'fold'"></mt-icon>
            </div>
        </div>
        <div ref="ctxContainer" class="tiledImages">
            <div ref="selectBox" v-show="selected" class="selectBox"
                :style="boxStyle"
            ></div>
        </div>
    </div>`,
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
            folded: false,
            foldPerCol: 50,
            selected: false,
            box: {
                pos: new Pos(),
                grid: new Pos()
            }
        }
    },
    created() {
        this.selection = {},
        this.folded = editor.userdata.get('folded', false);
        this.foldPerCol = editor.userdata.get('foldPerCol', 50);
        //oncontextmenu = function (e) { e.preventDefault() }
    },
    mounted() {
        this.tileImages = this.initTileImages();
        this.setTileFold(this.folded, this.foldPerCol);
    },
    methods: {
        toggleFold() {
            if (this.folded) {
                if (confirm("你想要展开素材吗？\n展开模式下将显示全素材内容。")) {
                    editor.userdata.set('folded', false);
                    this.folded = false;
                    this.setTileFold(false);
                }
            } else {
                const perCol = parseInt(prompt("请输入折叠素材模式下每列的个数：", "50")) || 0;
                if (perCol > 0) {
                    editor.userdata.get('foldPerCol', perCol);
                    editor.userdata.set('folded', true);
                    this.folded = true;
                    this.setTileFold(true, perCol);
                }
            }
        },

        initTileImages() {
            const createTileImage = (name) => {
                const [type, img] = name.split(":");
                const tileImage = new TileImage(() => {
                    return game.resource.getImage(type, img);
                }, tileConfigs[type] || {}, this.onselect.bind(this, name));
                this.$refs.ctxContainer.appendChild(tileImage.ctx.canvas);
                return tileImage;
            }
            const tilesets = game.resource.getList("tilesets");
            return imgNames.map((e) => createTileImage(e))
                .concat(tilesets.map((e) => createTileImage("tilesets:"+e)));
        },

        /**
         * 更新折叠状态
         * @param {Boolean} [folded] 是否折叠 
         * @param {Number} [perCol] 每列个数
         */
        setTileFold(folded, perCol) {
            folded = folded ?? this.folded;
            perCol = perCol ?? this.foldPerCol;
            for (let t of this.tileImages) {
                t.update(folded, perCol);
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

            } else {
                if (type == "terrains") {
                    if (index === 0) { // 特判清除块
                        this.$emit("select", "empty");
                        return;
                    } else index--;
                }
                const block = game.map.getBlockByIcon(type, index);
                this.$emit("select",  block);
            }
        },
        selectByIndex() {

        },
    }
}