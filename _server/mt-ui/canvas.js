/** canvas操作库 */

class ctxrd {

    constructor(ctx, option) {
        /**@type {CanvasRenderingContext2D} */
        this.ctx = ctx;
        this.canvas = this.ctx.canvas;
        this.setting(option);
    }

    /** 
     * 设置画布属性 
     * @param {String} options 
     * @param {} [value]
     */
    setting(options, value) {
        if (typeof options == "string") {
            switch (options) {
                case "width": break;
            }
        } else {
            // 特判以优化性能
            if (options.width && options.height) {
                delete options.width
            }
            for (let option in options) {
                this.setting(option, options[option]);
            }
        }
    }

    /** 获取画布像素数据 */
    getImageData(x, y, w, h) {
        if (arguments.length == 0) {
            return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        } else {
            return this.ctx.getImageData(x, y, w, h);
        }
    }

    /** 获取画布像素数据 */
    putImageData(x, y) {
        if (arguments.length == 0) {
            this.ctx.putImageData(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.putImageData(x, y);
        }
    }

    toImage() {
        return $.loadImage(this.canvas.toDataURL());
    }
}

/** @returns {ctxrd} */
export function $(source, option) {
    let ctx;
    switch(arguments.length) {
        case 0: ctx = document.createElement('canvas').getContext('2d'); break;
        case 1:
        case 2:
            if (source instanceof HTMLImageElement) {
                ctx = document.createElement('canvas').getContext('2d');
                ctx.canvas.width = image.width;
                ctx.canvas.height = image.height;
                ctx.drawImage(image, 0);
            } else if (source instanceof CanvasRenderingContext2D) {
                ctx = source;
            } else {
                option = source;
                ctx = document.createElement('canvas').getContext('2d');
            }
            break;
    }
    return new ctxrd(ctx, option);
}

/**
 * 获取像素
 * @param {ImageData} imgData 
 * @param {Number} x 
 * @param {Number} y 
 * @returns {Array<Number>} 像素的rgba值
 */
$.getPixel = function(x, y) {
    const offset = (x + y * imgData.width) * 4;
    return [
        imgData.data[offset + 0],
        imgData.data[offset + 1],
        imgData.data[offset + 2],
        imgData.data[offset + 3],
    ];
}

/**
 * 设置像素
 * @param {ImageData} imgData 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Array<Number>} rgba
 */
$.setPixel = function(imgData, x, y, rgba) {
    var offset = (x + y * imgData.width) * 4;
    imgData.data[offset + 0] = rgba[0];
    imgData.data[offset + 1] = rgba[1];
    imgData.data[offset + 2] = rgba[2];
    imgData.data[offset + 3] = rgba[3];
}

/**
 * 从content载入图像
 * @param {String} content 
 * @return {Promise<Image>}
 */
$.loadImage = function(content) {
    const image = new Image();
    return new Promise(() => {
        image.onload = function () {
            res(image);
        }
        image.src = content;
    })
}

/**
 * 修复画布
 * @param {ctxrd|CanvasRenderingContext2D} ctx
 */
$.fix = function(ctx) {
    if (ctx instanceof ctxrd) ctx = ctx.ctx
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}

/**
 * 遍历ImageData
 * @callback mapPixelFn
 * @param {Array<Number>} pixel
 * @returns {?Array<Number>}
 *
 * @param {ImageData} imageData 
 * @param {mapPixelFn} fn 
 * @returns {ImageData} 返回新的图像数据
 */
$.mapPixels = function(imageData, fn) {
    const res = new ImageData(imageData.data, imageData.width);
    const size = imageData.width * imageData.height;
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