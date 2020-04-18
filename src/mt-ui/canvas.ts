/** canvas操作库 */


type options = { [key: string]: any};

class CanvasProxy {

    fix = false;
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement

    constructor(ctx: CanvasRenderingContext2D, options?: options) {
        /**@type {CanvasRenderingContext2D} */
        this.ctx = ctx;
        this.canvas = this.ctx.canvas;
        if (options) this.setting(options);
    }

    setting(options: options): void;
    setting(option: string, value: any): void;

    /** 
     * 设置画布属性 
     */
    setting(options: options | string, value?: any ) {
        if (typeof options == "string") {
            switch (options) {
                case "width": break;
                case "fix": if (value != this.fix) {
                    this.fix = value;
                    this.ctx.imageSmoothingEnabled = value;
                } break;
                case "style": 
                for (let k in value) {
                    let v = value[k];
                    if (["width", "height"].includes(v) && typeof v == 'number') {
                        v = v + "px";
                    }
                    this.canvas.style[k] = v;
                }
                break;
            }
        } else {
            // 特判以优化性能
            if (options.width && options.height) {
                this.resize(options.width, options.height);
                delete options.width;
                delete options.height;
            }
            for (let option in options) {
                this.setting(option, options[option]);
            }
        }
    }

    getImageData(): void;
    getImageData(x: number, y: number, w: number, h: number): void;

    /** 获取画布像素数据 */
    getImageData(x?: number, y?: number, w?: number, h?: number) {
        if (arguments.length == 0) {
            return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } else {
            return this.ctx.getImageData(x, y, w, h);
        }
    }

    putImageData(ImageData: ImageData): void;
    putImageData(ImageData: ImageData, x: number, y: number): void;

    /** 
     * 设置画布像素数据
     * @todo 完成这个函数
     */
    putImageData(ImageData: ImageData, x?: number, y?: number) {
        if (arguments.length == 0) {
            this.ctx.putImageData(ImageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.putImageData(ImageData, x, y);
        }
    }

    async toImage() {
        return $.loadImage(this.canvas.toDataURL());
    }

    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /** */
    onRect() {

    }

    drawImage(img: HTMLCanvasElement | HTMLImageElement, x = 0, y = 0, w = img.width, h = img.height) {
        return {
            to: (dx: number, dy: number, dw = w, dh = h) => {
                this.ctx.drawImage(img, x, y, w, h, dx, dy, dw, dh);
            }
        }
    }
}

function $(): CanvasProxy;
function $(options: options): CanvasProxy;
function $(source: HTMLImageElement | CanvasRenderingContext2D | HTMLCanvasElement, options?: options): CanvasProxy;

function $(source?: options | HTMLImageElement | CanvasRenderingContext2D | HTMLCanvasElement, options?: options): CanvasProxy {
    let ctx;
    if (arguments.length == 0) {
        return new CanvasProxy(document.createElement('canvas').getContext('2d'));
    }
    if (source instanceof HTMLImageElement) {
        ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = source.width;
        ctx.canvas.height = source.height;
        ctx.drawImage(source, 0, 0);
    } else if (source instanceof CanvasRenderingContext2D) {
        ctx = source;
    } else if (source instanceof HTMLCanvasElement) {
        ctx = source.getContext("2d");
    } else {
        options = source;
        ctx = document.createElement('canvas').getContext('2d');
    }
    return new CanvasProxy(ctx, options);
}

export default $;

/**
 * 获取像素
 * @returns 像素的rgba值
 */
$.getPixel = function(imgData: ImageData, x: number, y: number): number[] {
    const offset = (x + y * imgData.width) * 4;
    return [
        imgData.data[offset + 0],
        imgData.data[offset + 1],
        imgData.data[offset + 2],
        imgData.data[offset + 3],
    ];
}

type rgba = [number, number, number, number];

/**
 * 设置像素
 */
$.setPixel = function(imgData: ImageData, x: number, y: number, rgba: rgba) {
    var offset = (x + y * imgData.width) * 4;
    imgData.data[offset + 0] = rgba[0];
    imgData.data[offset + 1] = rgba[1];
    imgData.data[offset + 2] = rgba[2];
    imgData.data[offset + 3] = rgba[3];
}

/**
 * 从content载入图像
 */
$.loadImage = function(content: string): Promise<HTMLImageElement> {
    const image = new Image();
    return new Promise((res) => {
        image.onload = () => res(image);
        image.src = content;
    })
}

/**
 * 修复画布
 */
$.fix = function(ctx: CanvasProxy | CanvasRenderingContext2D) {
    if (ctx instanceof CanvasProxy) ctx = ctx.ctx
    ctx.imageSmoothingEnabled = false;
}

type mapPixelFn = (pixel: number[]) => number[];

/**
 * 遍历ImageData
 * @returns 返回新的图像数据
 */
$.mapPixels = function(imgData: ImageData, fn: mapPixelFn): ImageData {
    const res = new ImageData(imgData.data, imgData.width);
    const size = imgData.width * imgData.height;
    for (let offset = 0; offset < size; offset += 4) {
        const ret = fn([
            imgData.data[offset + 0],
            imgData.data[offset + 1],
            imgData.data[offset + 2],
            imgData.data[offset + 3],
        ])
        if (ret) {
            res.data[offset + 0] = ret[0];
            res.data[offset + 1] = ret[1];
            res.data[offset + 2] = ret[2];
            res.data[offset + 3] = ret[3];
        }
    }
    return res;
}