import { $ } from "../mt-ui/canvas.js"
import { isset } from "../editor_util.js"
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
    constructor(datasource, config, onclick) {
        this.ctx = $({ style: { position: "relative" }});
        this.config = config;
        this.datasource = datasource;
        this.ctx.canvas.addEventListener("click", function(e) {
            const [w, h] = this.getGrid();
            onclick(Math.floor(e.layerX) / w, Math.floor(e.layerY / h));
        }.bind(this));
        if (config.drawRect) {
            // this.ctx.onRect(fn, this.getGrid());
        }
    }

    getGrid() {
        const config = this.config;
        let grid = config.grid || [1, 1];
        if (!Array.isArray(grid)) grid = [grid, 1];
        if (config.folded) grid = [1, 1];
        return [config.width * grid[0] || 32, h = config.height * grid[1] || 32];
    }

    update(folded, perCol) {
        const config = this.config;
        const image = this.datasource();
        let grid = config.grid || [1, 1];
        if (!Array.isArray(grid)) grid = [grid, 1];
        let w = config.width || 32, h = config.height || 32;
        const offset = config.offset || 0;

        if (folded) config.folded = folded;
        if (perCol) config.perCol = perCol;
        // 计算宽高
        
        let oriCol, oriRow;
        if (config.imageArray) {
            oriCol = 1, oriRow = image.length;
        } else {
            oriCol = image.width / grid[0] / w;
            oriRow = image.height / grid[1] / h;
        }
        let col = oriCol, row = oriRow + offset;
        if (config.folded && !config.nowrap) {
            grid = [1, 1];
            col = Math.ceil(row / config.perCol);
            row = config.perCol;
        }

        w *= grid[0], h *= grid[1];
        this.ctx.resize(col*w, row*h);
        this.ctx.setting("style", { width: col*w, height: row*h });

        // 绘制
        if (config.imageArray) {
            for (let i = 0; i < oriRow; i++) {
                this.ctx.ctx.drawImage(image[i], 0, 0, w, h, 0, i*h, w, h);
            }
        } else {
            const total = oriCol * oriRow;
            for (let i = 0, cnt = 0; i < col; i++) {
                const sh = Math.min(total-cnt, row)*h, sy = Math.max(offset-cnt, 0)*h;
                this.ctx.ctx.drawImage(image, 0, cnt*h, oriCol*w, sh, i*w, sy, oriCol*w, sh);
                cnt += row;
            }
        }
    }
}

export default {
    template: /* HTML */`
    <div class="paintBox">
        <div ref="ctxContainer" class="tiledImages" @mousedown="ondown"></div>
        <button class="expandBtn" @click="toggleFold">{{ folded ? "展开素材区" : "折叠素材区" }}</button>
    </div>`,
    data: function() {
        return {
            scrollBarHeight :0,
            folded: false,
            foldPerCol: 50,
            selected: false,
        }
    },
    created: function() {
        this.selection = {},
        this.icons = game.map.getIcons();
        this.folded = editor.userdata.get('folded', false);
        this.foldPerCol = editor.userdata.get('foldPerCol', 50);
        //oncontextmenu = function (e) { e.preventDefault() }
    },
    mounted: function() {
        this.tileImages = this.initTileImages();
        this.setTileFold(this.folded, this.perCol);
    },
    methods: {
        toggleFold() {
            if (this.folded) {
                if (confirm("你想要展开素材吗？\n展开模式下将显示全素材内容。")) {
                    editor.userdata.set('folded', false);
                    this.setTileFold(false);
                }
            } else {
                const perCol = parseInt(prompt("请输入折叠素材模式下每列的个数：", "50")) || 0;
                if (perCol > 0) {
                    editor.userdata.get('foldPerCol', perCol);
                    editor.userdata.set('folded', true);
                    this.setTileFold(true, 50);
                }
            }
            this.folded = !this.folded;
        },

        initTileImages(images) {
            const tileImages = [];
            for (let c of imgNames) {
                const tileImage = new TileImage(() => {
                    return game.resource.getImage(c);
                }, tileConfigs[c] || {}, console.log);
                this.$refs.ctxContainer.appendChild(tileImage.ctx.canvas);
                tileImages.push(tileImage);
            }
            return tileImages.concat(game.resource.getList("tilesets").map((e) => {
                const tileImage = new TileImage(() => {
                    return game.resource.getImage("tilesets", e);
                }, tileConfigs.tilesets, console.log);
                this.$refs.ctxContainer.appendChild(tileImage.ctx.canvas);
                return tileImage;
            }));
        },

        /**
         * 更新折叠状态
         * @param {Boolean} [folded] 是否折叠 
         * @param {Number} [perCol] 每列个数
         */
        setTileFold(folded, perCol) {
            if (!isset(folded)) folded = this.folded;
            if (!perCol) perCol = this.foldPerCol;
            for (let t of this.tileImages) {
                t.update(folded, perCol);
            }
        },
        ondown: function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (!editor.isMobile && e.clientY >= this.$el.offsetHeight - editor.ui.values.scrollBarHeight) return;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var loc = {
                'x': scrollLeft + e.clientX + this.$el.scrollLeft - right.offsetLeft - this.$el.offsetLeft,
                'y': scrollTop + e.clientY + this.$el.scrollTop - right.offsetTop - this.$el.offsetTop,
                'size': 32
            };
            editor.uivalues.tileSize = [1,1];
            var pos = editor.uifunctions.locToPos(loc);
            for (var spriter in editor.widthsX) {
                if (pos.x >= editor.widthsX[spriter][1] && pos.x < editor.widthsX[spriter][2]) {
                    var ysize = spriter.endsWith('48') ? 48 : 32;
                    loc.ysize = ysize;
                    pos.images = editor.widthsX[spriter][0];
                    pos.y = ~~(loc.y / loc.ysize);
                    if (!this.folded && core.tilesets.indexOf(pos.images) == -1) pos.x = editor.widthsX[spriter][1];
                    var autotiles = core.material.images['autotile'];
                    if (pos.images == 'autotile') {
                        var imNames = Object.keys(autotiles);
                        if ((pos.y + 1) * ysize > editor.widthsX[spriter][3])
                            pos.y = ~~(editor.widthsX[spriter][3] / ysize) - 4;
                        else {
                            for (var i = 0; i < imNames.length; i++) {
                                if (pos.y >= 4 * i && pos.y < 4 * (i + 1)) {
                                    pos.images = imNames[i];
                                    pos.y = 4 * i;
                                }
                            }
                        }
                    }
                    else {
                        var height = editor.widthsX[spriter][3], col = height / ysize;
                        if (this.folded && core.tilesets.indexOf(pos.images) == -1) {
                            col = (pos.x == editor.widthsX[spriter][2] - 1) ? ((col - 1) % editor.uivalues.foldPerCol + 1) : editor.uivalues.foldPerCol;
                        }
                        if (spriter == 'terrains' && pos.x == editor.widthsX[spriter][1]) col += 2;
                        pos.y = Math.min(pos.y, col - 1);
                    }
    
                    this.selected = true;
                    // console.log(pos,core.material.images[pos.images].height)
                    this.selectionStyle.left = pos.x * 32 + 'px';
                    this.selectionStyle.top = pos.y * ysize + 'px';
                    this.selectionStyle.height = ysize - 6 + 'px';
    
                    if (pos.x == 0 && pos.y == 0) {
                        // editor.info={idnum:0, id:'empty','images':'清除块', 'y':0};
                        editor.info = 0;
                    } else if (pos.x == 0 && pos.y == 1) {
                        editor.info = editor.ids[editor.indexs[17]];
                    } else {
                        if (autotiles[pos.images]) editor.info = { 'images': pos.images, 'y': 0 };
                        else if (core.tilesets.indexOf(pos.images) != -1) editor.info = { 'images': pos.images, 'y': pos.y, 'x': pos.x - editor.widthsX[spriter][1] };
                        else {
                            var y = pos.y;
                            if (this.folded) {
                                y += editor.uivalues.foldPerCol * (pos.x - editor.widthsX[spriter][1]);
                            }
                            if (pos.images == 'terrains' && pos.x == 0) y -= 2;
                            editor.info = { 'images': pos.images, 'y': y }
                        }
    
                        for (var ii = 0; ii < editor.ids.length; ii++) {
                            if ((core.tilesets.indexOf(pos.images) != -1 && editor.info.images == editor.ids[ii].images
                                && editor.info.y == editor.ids[ii].y && editor.info.x == editor.ids[ii].x)
                                || (Object.prototype.hasOwnProperty.call(autotiles, pos.images) && editor.info.images == editor.ids[ii].id
                                    && editor.info.y == editor.ids[ii].y)
                                || (core.tilesets.indexOf(pos.images) == -1 && editor.info.images == editor.ids[ii].images
                                    && editor.info.y == editor.ids[ii].y)
                            ) {
    
                                editor.info = editor.ids[ii];
                                break;
                            }
                        }
    
                        if (editor.info.isTile && e.button == 2) {
                            var v = prompt("请输入该额外素材区域绑定宽高，以逗号分隔", "1,1");
                            if (v != null && /^\d+,\d+$/.test(v)) {
                                v = v.split(",");
                                var x = parseInt(v[0]), y = parseInt(v[1]);
                                var widthX = editor.widthsX[editor.info.images];
                                if (x <= 0 || y <= 0 || editor.info.x + x > widthX[2] - widthX[1] || 32*(editor.info.y + y) > widthX[3]) {
                                    alert("不合法的输入范围，已经越界");
                                } else {
                                    editor.uivalues.tileSize = [x, y];
                                }
                            }
                        }
    
                    }
                    tip.infos(JSON.parse(JSON.stringify(editor.info)));
                    editor_mode.onmode('nextChange');
                    editor_mode.onmode('enemyitem');
                    editor.updateLastUsedMap();
                    //editor_mode.enemyitem();
                }
            }
        }
    }
}