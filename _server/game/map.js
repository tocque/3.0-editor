/**
 * @file game/map.js 游戏地图相关的接口
 */
import game from "../editor_game.js";
import { clone } from "../editor_util.js";
import locComment from "../comments/loc.comment.js";

/**
 * 由mapStruct数组构造mapTree
 * @param {Array} mapStruct 
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
    return clone(game.maps[mapid]);
}

export const getIcons = function() {
    return game.oriData.icons;
}

/**
 * 
 * @param {pos} pos 
 * @param {String|Object} floor 地图
 */
export const getPosInfo = function(pos, floor) {
    const fields = Object.keys(locComment);
    this.block = core.clone(this.$host.blockAt(pos));
    this.events = {};
    this.pos = pos.copy();
    let events = this.events;
    fields.forEach((v) => {
        events[v] = core.clone(editor.currentFloorData[v][pos.format(",")]);
    })
}

////////////////////////// setter //////////////////////////


////////////////////////// wrapapi //////////////////////////

/**
 * 
 * @param {String} mapid 地图名称 
 */
export const changeFloor = async function(mapid) {
    const core = game.core;
    return new Promise((res, rej) => {
        core.changeFloor(mapid, null, {"x": 0, "y": 0, "direction": "up"}, null, res, true);
    });
}