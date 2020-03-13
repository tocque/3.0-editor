/**
 * @file game/map.js 游戏地图相关的接口
 */
import game from "../editor_game.js";
import { isset, clone } from "../editor_util.js";
import locComment from "../comments/loc.comment.js";

export let fgmap = [], bgmap = [];
/**
 * @typedef {Object} Block
 * @property {"terrains"|"item"|"npc"|"npc48"|"enemys"|"enemy48"|"animate"|"autotiles"} cls 图块类别
 * @property {String} id
 */

export const isEmpty = function(array) {
    return !Array.isArray(array) || !Array.isArray(array[0]);
}

export const createEmetyArray = function(width, height) {
    const arr = new Array(height);
    for (let i = 0; i < arr.length; i++) arr[i] = new Array(width).fill(0);
    return arr;
}

/**
 * @param {Array} mapArr 地图数组
 * @returns {Array}
 */
export const cloneMapArray = function(map) {
    const copy = new Array(map.length);
    for (let i = 0; i < map.length; i++) {
        copy[i] = [].concat(map[i]);
    }
    return copy;
}

/**
 * 解析地图解构, 地图解构为用数组存储的树
 * @param {Array} arr 
 * @param {*} attach 
 */
const decodeMapStruct = function(arr, attach) {
    let output = [], record = {};
    for (let e of arr) {
        if (e instanceof Array) {
            let { output: o, record: r } = decodeMapStruct(e, attach);
            output[output.length-1].children = o;
            record = Object.assign({}, record, r);
        } else {
            output.push({ mapid: e, map: attach[e] });
            record[e] = true;
        }
    }
    return { output, record };
}

const icon2id = {};

export const init = function() {
    const icons = game.oriData.icons;
    for (let type in icons) {
        if (type == "hero") continue;
        const dict = {};
        for (let id in icons[type]) {
            dict[icons[type][id]] = id;
        }
        icon2id[type] = dict;
    }
}

////////////////////////// getter //////////////////////////

/** 
 * 获取地图列表
 * @returns {Array<String>}
 */
export const getMapList = function() {
    return [].concat(game.main.floorIds);
}

export const getMapTree = function() {
    const mapStruct = editor.towerInfo.get("mapStruct");
    const { output, record } = decodeMapStruct(mapStruct, game.maps);
    for (let mapid of game.main.floorIds) {
        if (!record[mapid]) {
            output.push({ mapid, map: game.maps[mapid] });
        }
    }
    return output;
}

/**
 * 获取地图
 * @param {String} mapid 地图ID 
 */
export const getMap = function(mapid) {
    return clone(game.maps[mapid].data);
}

/**
 * 
 * @param {String} type 
 * @param {Number} index 
 * @returns {Block}
 */
export const getBlockByIcon = function(type, index) {
    let id;
    if (type == "autotiles") {
        id = game.oriData.data.main.autotiles[index];
    } else id = icon2id[type][index];
    if (!isset(id)) {
        return { type, index };
    }
    return game.apply("getBlockInfo", id) || { type, index };
}

/**
 * 
 * @param {pos} pos 
 * @param {String|Object} floor 地图
 */
export const getPosInfo = function(pos, floor) {
    const fields = Object.keys(locComment._data);
    const events = {};
    fields.forEach((v) => {
        events[v] = clone(floor[v][pos.format(",")]);
    })
    return { pos: pos.copy(), events }
}

////////////////////////// setter //////////////////////////

export const setBlock = function(mapid, pos, blockid) {

}

////////////////////////// wrapapi //////////////////////////

/**
 * 
 * @param {String} mapid 地图名称 
 */
export const changeFloor = async function(mapid) {
    const core = game.core;
    return new Promise((res, rej) => {
        fgmap = clone(game.maps[mapid].data.fgmap);
        bgmap = clone(game.maps[mapid].data.bgmap);
        core.changeFloor(mapid, null, {"x": 0, "y": 0, "direction": "up"}, null, res, true);
    });
}

/**
 * 更新地图画面
 * @param map
 */
export const updateMap = function (map) {
    fgmap = clone(map.fgmap);
    bgmap = clone(map.bgmap);
    const blocks = game.apply("maps._mapIntoBlocks", map.map, { 
        events: map.events
    }, map.floorId);
    game.core.status.thisMap.blocks = blocks;
    
    game.apply("drawMap");
}