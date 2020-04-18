/**
 * @file utils.ts 工具函数存放在此处
 */

export const createGuid = function (): string {
    return 'id_' + 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const HTMLescape = function (str_: string) {
    return str_.split('')
        .map((v) => '&#' + v.charCodeAt(0) + ';')
        .join('');
}

// rgbToHsl hue2rgb hslToRgb from https://github.com/carloscabo/colz.git
//--------------------------------------------
// The MIT License (MIT)
//
// Copyright (c) 2014 Carlos Cabo
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//--------------------------------------------
// https://github.com/carloscabo/colz/blob/master/public/js/colz.class.js
var round = Math.round;
export const rgbToHsl = function (rgba) {
    var arg, r, g, b, h, s, l, d, max, min;

    arg = rgba;

    if (typeof arg[0] === 'number') {
        r = arg[0];
        g = arg[1];
        b = arg[2];
    } else {
        r = arg[0][0];
        g = arg[0][1];
        b = arg[0][2];
    }

    r /= 255;
    g /= 255;
    b /= 255;

    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    //CARLOS
    h = round(h * 360);
    s = round(s * 100);
    l = round(l * 100);

    return [h, s, l];
}
//
export const hue2rgb = function (p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1 / 6) { return p + (q - p) * 6 * t; }
    if (t < 1 / 2) { return q; }
    if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6; }
    return p;
}
export const hslToRgb = function (hsl) {
    var arg, r, g, b, h, s, l, q, p;

    arg = hsl;

    if (typeof arg[0] === 'number') {
        h = arg[0] / 360;
        s = arg[1] / 100;
        l = arg[2] / 100;
    } else {
        h = arg[0][0] / 360;
        s = arg[0][1] / 100;
        l = arg[0][2] / 100;
    }

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {

        q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [round(r * 255), round(g * 255), round(b * 255)];
}

export const encode64 = function (str: string) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16))
    }))
}

export const decode64 = function (str: string) {
    return decodeURIComponent(atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
}

/** 判断某对象是否不为null也不为NaN */
export const isset = function (val: any) {
    return val != undefined && val != null && !(typeof val == 'number' && isNaN(val));
}

export const exec = function (func: Function, ...args: any[]) {
    if (typeof func === "function") return func(...args);
}

/** 深拷贝一个对象 */
export const clone = function<T> (data: T): T {
    if (!isset(data)) return null;
    // date
    if (data instanceof Date) {
        // @ts-ignore
        return new Date(data);
    }
    // array
    if (Array.isArray(data)) {
        const copy = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            copy[i] = clone(data[i]);
        }
        // @ts-ignore
        return copy;
    }
    // 函数
    if (data instanceof Function) {
        return data;
    }
    // object
    if (data instanceof Object) {
        const copy: { [key: string]: any } = {};
        for (let i in data) {
            if (data.hasOwnProperty(i))
                copy[i] = clone(data[i]);
        }
        // @ts-ignore
        return copy;
    }
    return data;
}

export const checkUnique = function (thiseval: string[]) {
    if (!(thiseval instanceof Array)) return false;
    const set: {[key: string]: boolean} = {};
    for (let item of thiseval) {
        if (set[item]) {
            return false;
        }
        set[item] = true;
    }
    return true;
}

const keyCodeDict: {[key:string]: number} = {
    "backspace": 8,
    "tab": 9,
    "enter": 13,
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "esc": 27,
    "spcae": 32,
    "pageup": 33,
    "pagedown": 34,
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40,
    "delete": 46,
};

/** 翻译键盘码 */
export const translateKeyCode = function(keyCode: string): number {
    if (keyCodeDict[keyCode]) return keyCodeDict[keyCode];
    if (keyCode.length > 1) {
        if (keyCode[0] == 'f')  { // 功能键
            const fcode = parseInt(keyCode.substr(1));
            if (fcode >= 1 && fcode <= 12) return 111 + fcode;
        }
        else if (keyCode[0] == 'k')  { // 键盘码, 为与数字区分前面需要加k
            return parseInt(keyCode.slice(1));
        }
    } else {
        const charcode = keyCode.charCodeAt(0);
        if (charcode >= 48 && charcode <= 57) return charcode; // 数字
        if (charcode >= 97 && charcode <= 122) return charcode-32; // 字母
    }
    throw new Error(keyCode+"不是合法的键盘码");
}

/** 向一个对象的所有键值对混入一个对象 */
export const batchMixin = function(obj: object, m: object) {
    const newObj = {};
    for (let e in obj) {
        newObj[e] = Object.assign({}, m, obj[e]);
    }
    return newObj;
}

export class Pos {

    x: number
    y: number

    constructor(x, y) {
        if (typeof x == 'string') {
            x = x.split(y);
            this.x = x[0], this.y = x[1];
        }
        else if (x instanceof Pos) this.x = x.x, this.y = x.y;
        else this.x = x || 0, this.y = y || 0;
    }

    /**
     * 将坐标转为网格坐标
     * @param xsize 网格宽度 
     * @param ysize 网格高度, 若不填则视为与宽度相同
     */
    gridding(xsize: number, ysize = xsize): Pos {
        return new Pos(Math.floor(this.x/xsize), Math.floor(this.y/ysize));
    }

    set(x, y) {
        if (x instanceof Pos) y = x.y, x = x.x;
        this.x = x, this.y = y;
    }

    add(x: number, y = x) {
        return new Pos(this.x + x, this.y + y);
    }

    mutli(x: number, y = x) {
        return new Pos(this.x * x, this.y * y);
    }

    /**
     * 格式化输出
     * @param separator 分隔符
     */
    format(separator: string): string {
        return this.x + separator + this.y;
    }

    copy() {
        return new Pos(this.x, this.y);
    }

    equal(p: Pos) {
        return this.x === p.x && this.y === p.y;
    }

    in(x: number, y: number, w: number, h: number) {
        return this.x >= x && this.x <= x+w 
            && this.y >= y && this.y <= y+h;
    }
}

export class CommandStack {

    size: number;
    stack: Array<{type: string, data: object}> = [];
    pointer = -1;
    commands = {};

    /**
     * 命令栈
     * @param size 命令栈的大小, 默认为20 
     */
    constructor(size = 20) {
        this.size = size;
    }

    /**
     * 注册命令
     * @param type 类型 
     * @param redo 重做时执行的函数
     * @param undo 
     */
    register(type: string, redo: Function, undo: Function) {
        this.commands[type] = { redo, undo }
    }

    push(type: string, data: object) {
        if (this.pointer < this.stack.length-1) {
            this.stack.splice(this.pointer+1);
            this.pointer = this.stack.length;
        } else if (this.stack.length >= this.size) this.stack.shift();
        else this.pointer++;
        data = this.commands[type].redo(data, true);
        this.stack.push({ type, data });
    }

    hasBack() { return this.pointer >= 0; }

    undo() {
        if (!~this.pointer) return false;
        const command = this.stack[this.pointer--];
        this.commands[command.type].undo(command.data);
        return true;
    }

    hasNext() { return this.pointer < this.stack.length-1; }

    redo() {
        if (this.pointer >= this.stack.length-1) return false;
        const command = this.stack[++this.pointer];
        this.commands[command.type].redo(command.data);
        return true;
    }

    clear() {
        this.stack = [], this.pointer = -1;
    }
}

export const mountJs = function(text: string) {
    const script = document.createElement('script');
    script.innerHTML = text;
    document.body.appendChild(script);
}

/**
 * 将aa.bb或者["aa"]["bb"]转换为数组形式
 */
export const resolvePath = function(route: string) {
    return route.startsWith('["') 
        ? route.slice(2, -2).split('"][""')
        : route.split(".");
}

export const isEmpty2DArray = function(array: any) {
    return !Array.isArray(array) || !Array.isArray(array[0]);
}

export const create2DArray = function(width: number, height: number) {
    const arr = new Array(height);
    for (let i = 0; i < arr.length; i++) arr[i] = new Array(width).fill(0);
    return arr;
}

export const clone2DArray = function(array: [][]): [][] {
    const copy = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        copy[i] = [].concat(array[i]);
    }
    return copy;
}
