/**
 * @file game/map.js 游戏资源相关的接口
 */
import game from "../game.js";
import { accessField } from "../utils.js"

class Dir {
    constructor (config) {
        this.init(config);
    }

    init(config) {
        Object.entries(config).forEach(([k, v]) => this[k] = v);
        if (!Array.isArray(this.acceptSuffix)) {
            /** @type {String} */this.defaultSuffix = this.acceptSuffix;
            /** @type {Array<String>} */this.acceptSuffix = [this.acceptSuffix];
        }
        this.suffixReg = new RegExp(`(${this.acceptSuffix.join('|')})$`, "i");
    }

    /** @returns {Array<String>} */
    getList() {
        if (this.list) {
            return accessField(game.runtime, this.list);
        } else {
            return game.oriData.data.main[this.path];
        }
    }

    /**
     * 判断一个文件名是否是可用的
     * @param {String} filename 
     * @returns {Boolean}
     */
    isAccepted(filename) {
        return this.suffixReg.test(filename);
    }

    getRegName(filename) {
        return filename.slice(0, filename.lastIndexOf("."));
    }

    outputInfo() {
        return {
            label: this.label,
            name: this.path,
            const: this.const,
            editable: this.editable
        };
    }
}

/**@type {Map<String, Dir>} 所有目录 */const dirs = new Map();

export const init = function() {
    const _dirs = editor.gameInfo.get("dirs", {});
    const dirType = editor.gameInfo.get("dirType", {});
    for (let _dir of _dirs) {
        dirs.set(_dir.path, new Dir(Object.assign({}, dirType[_dir.type], _dir)));
    }
}

////////////////////////// getter //////////////////////////

/**
 * 列出所有的目录
 * @returns {Array<Object>}
 */
export const listDirs = function() {
    return [...dirs].map((e) => e[1].outputInfo());
}
 
/** 
 * 获取文件列表
 * @param {String} dirname 目录名称
 * @param {Boolean} filter 是否只筛选允许的后缀
 */ 
export const readDir = async function(dirname, filter) {
    const dir = dirs.get(dirname);
    return new Promise((res, rej) => {
        fs.readdir('project/'+dirname, (err, data) => {
            if (err) rej(err);
            else {
                if (filter) data = data.filter((e) => dir.isAccepted(e));
                res(data);
            }
        });
    })
}

/**
 * 获取注册的文件列表
 * @param {String} dirname
 * @returns {Array<String>}
 */
export const getList = function(dirname, needSuffix) {
    const dir = dirs.get(dirname);
    const list = dir.getList();
    if (dir.defaultSuffix && needSuffix) {
        return list.map((e) => {
            if (!e.includes(".")) e += dir.defaultSuffix;
            return e;
        })
    } else return [].concat(list);
}

/**
 * 获取图像资源
 * @param {String} dirname 目录
 * @param {String} name 图像名称
 * @returns {Image|Array<{Image}>}
 */
export const getImage = function(dirname, name) {
    const res = game.main.core.material.images[dirname];
    if (name) return res[name];
    return game.apply("sprite._getImages", game.main.core.sprite, dirname);
}

////////////////////////// setter //////////////////////////

/**
 * @todo 同时加载对应文件
 * 注册文件
 * @param {String} dirname
 * @param {String} filename
 * @returns
 */
export const regFile = async function(dirname, filename) {
    const dir = dirs.get(dirname);
    if (!dir.isAccepted(filename)) return;
    const list = dir.getList();
    const regName = dir.getRegName(filename);
    if (list.includes(regName)) return;
    list.push(regName);
    return game.gameData.data.modify({ key: `[main][${dir.path}]`, value: list });
}

export const unRegFile = async function(dirname, filename) {
    const dir = dirs.get(dirname);
    const list = dir.getList();
    const regName = dir.getRegName(filename);
    const id = list.indexOf(regName);
    if (id < 0) return;
    list.splice(id, 1);
    return game.gameData.data.modify({ key: `[main][${dir.path}]`, value: list });
}

////////////////////////// wrapapi //////////////////////////