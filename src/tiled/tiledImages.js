import $ from "../mt-ui/canvas.js"
import { Pos } from "../utils.js"
import { getIcon } from "./icon.js"

/**
 * 网格索引
 */
class GridDict {

    BASE = 32;
    perCol = 50;
    grid = [[]];
    currentLeft;
    cnt;

    init(perCol) {
        this.grid = [[]];
        this.perCol = perCol ?? this.perCol;
        this.currentLeft = perCol * 32;
        this.cnt = 0;
    }

    insert(cnt, width, height) {
        const scale = 32 / width;
        const h = height*scale;
        const layout = [];
        while(this.currentLeft < h * cnt) {
            const lcnt = Math.min(Math.floor(this.currentLeft / h), cnt);
            cnt -= lcnt;
            const sy = this.perCol * this.BASE-this.currentLeft;
            const part = {
                sy, 
                num: lcnt, 
                dy: sy + lcnt * h, 
                st: this.cnt, 
                h,
                sx:(this.grid.length-1) * this.BASE,
            };
            this.cnt += lcnt;
            this.grid[this.grid.length-1].push(part);
            layout.push(part);
            this.currentLeft -= lcnt * h;
            if (cnt == 0) return layout;
            this.currentLeft = this.perCol * this.BASE;
            this.grid.push([]);
        }
        this.currentLeft -= cnt * h;
        const nowcol = this.grid[this.grid.length-1];
        const ldy = nowcol[nowcol.length-1]?.dy || 0;
        const part = {
            sy: ldy, num: cnt, dy: ldy + cnt * h, st: this.cnt, h,
            sx:(this.grid.length-1) * this.BASE,
        }
        this.cnt += cnt;
        nowcol.push(part);
        layout.push(part);
        return layout;
    }

    locate(pos) {
        const col = this.grid[Math.floor(pos.x / 32)];
        const res = col.find(({ sy, dy }) => pos.y >= sy && pos.y < dy);
        if (!res) return { index: -1 };
        const cnt = Math.floor((pos.y - res.sy) / res.h);
        return { 
            index: res.st + cnt, 
            lrpos: new Pos(col*32, res.sy + cnt * res.h), 
            grid: new Pos(32, res.h) 
        }
    }

    size() {
        return new Pos(32*this.grid.length, this.grid.reduce((n, e) => {
            return Math.max(n, e[e.length-1]?.dy || 0);
        }, Math.max()))
    }
}

export class SpritesImage {

    gridDict = new GridDict;

    /**
     * Creates an instance of SpritesImage.
     * @param {Function} datasource
     * @param {Function} onselect
     * @memberof tileImage
     */
    constructor(datasource, onselect) {
        this.ctx = $({ style: { position: "relative" }});
        this.datasource = datasource;
        this.setClickListener(onselect);
    }

    setClickListener(fn) {
        const cv = this.ctx.canvas;
        cv.addEventListener("click", (e) => {
            const pos = new Pos(e.layerX, e.layerY);
            const { index, lrpos, grid } = this.gridDict.locate(pos);
            if (index < 0) return;
            fn(lrpos.add(cv.offsetLeft, cv.offsetTop), grid, index);
        });
    }

    update(perCol) {
        this.gridDict.init(perCol);
        const images = this.datasource();
        const gridInfo = images.map(({img, meta}) => {
            const cnt = meta.line*meta.row;
            return [
                img,
                meta,
                this.gridDict.insert(cnt, meta.width, meta.height)
            ]
        })
        const size = this.gridDict.size();
        this.ctx.resize(size.x, size.y);
        this.ctx.setting("style", { width: size.x, height: size.x });
        gridInfo.forEach(([img, { width, height, row, blocks }, layout]) => {
            const w = this.gridDict.BASE;
            let fcnt = 0;
            layout.forEach(({ sx, sy, num, h }) => {
                for (let i = 0; i < num; i++) {
                    if (blocks[fcnt]?.editorIcon) {
                        this.ctx.drawImage(getIcon(blocks[fcnt].editorIcon))
                            .to(sx, sy+i*h, w, h);
                    } else {
                        const nx = (fcnt % row) * width,
                            ny = Math.floor(fcnt / row) * height;
                        this.ctx.drawImage(img, nx, ny, width, height)
                            .to(sx, sy+i*h, w, h);
                    }
                    fcnt++;
                }
            })
        })
    }
}

export class TilesetsImage {

    /**
     * Creates an instance of TilesetsImage.
     * @param {Image} image
     * @param {{ondown: Function, onmove: Function, onup: Function}} onselect
     * @memberof tileImage
     */
    constructor(image, onselect) {
        this.ctx = $(image, { style: { position: "relative" }});
        this.setRectListener(onselect);
    }

    setRectListener({ ondown, onmove, onup }) {
        const cv = this.ctx.canvas;
        cv.addEventListener("mousedown", (e) => {
            const pos = new Pos(e.layerX, e.layerY).gridding(32, 32).mutli(32, 32)
                .add(cv.offsetLeft, cv.offsetTop);
            const grid = new Pos(32, 32);
            fn(pos, grid);
        });
    }

    update() {

    }
}
