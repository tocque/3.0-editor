/**
 * @file game/map.js 游戏资源相关的接口
 */
import game from "../editor_game.js";
import { accessField } from "../editor_util.js"



////////////////////////// getter //////////////////////////

/**
 * @returns {Array<Object>}
 */
export const listDirs = function() {
    return editor.gameInfo.get("dirs", {});
}
 
/** 
 * 获取文件列表
 * @param {String} dirname 目录名称
 */ 
export const readDir = async function(dirname) {
    return new Promise((res, rej) => {
        fs.readdir('project/'+dirname, (err, data) => {
            if (err) rej(err);
            else res(data);
        });
    })
}

/**
 * 获取注册的资源列表
 * @param {Object|String} folder
 * @returns {Array<String>}
 */
export const getList = function(folder) {
    if (typeof folder == "string") {
        folder = listDirs().find((e) => e.path == folder);
    }
    let registered = [];
    if (folder.src) {
        registered = accessField(game.runtime, folder.src);
    } else {
        registered = game.oriData.data.main[folder.path];
    }
    const suffix = editor.gameInfo.get("suffix", {})[folder.type];
    if (suffix) registered = registered.map((e) => {
        if (!e.includes(".")) e += suffix;
        return e;
    })
    return registered;
}

export const getImage = function(dir, name) {
    const res = game.main.core.material.images[dir];
    if (res instanceof Image) {
        return res;
    } else {
        if (name) return res[name];
        return game.oriData.data.main[dir].map((e) => res[e]);
    }
}

////////////////////////// setter //////////////////////////


////////////////////////// wrapapi //////////////////////////