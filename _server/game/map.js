/**
 * @file game/map.js 游戏地图相关的接口
 */
import game from "../editor_game.js";
import { isset, clone, createGuid } from "../editor_util.js";
import { ftools, JsFile } from "../editor_file.js";
import locComment from "../comments/loc.comment.js";

export class MapFile extends JsFile {
    /**
     * 地图文件的类
     * @param {String} mapid
     * @param {*} data
     * @memberof MapFile
     */
    constructor(mapid, data) {
        super(`./project/floors/${mapid}.js`, data, `main.floors.${mapid}=\n`, {
            stringifier(data) {
                const tempObj = Object.assign({}, data);
                const tempMap = ['map', 'bgmap','fgmap'].map((key) => {
                    const value = [key, createGuid(), tempObj[key]];
                    tempObj[key] = value[1];
                    return value;
                });
                const tempJson = JSON.stringify(tempObj, null, 4);
                return tempMap.reduce((e, [k, g, v]) => {
                    return e.replace(`"${g}"`, `[\n${ftools.formatMap(v, k != 'map')}\n]`)
                }, tempJson);
            }
        });
        this.addEmitter('afterSave', function(h, str) {
            //editor.addUsedFlags(str);
        });
    }
}

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

export const checkMapInfo = function(map) {
    if (game.main.floorIds.includes(map.floorId)) {
        throw new Error("该楼层已存在！");
    }
    if (!(/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(map.floorId))) {
        throw new Error("楼层名不合法！请使用字母、数字、下划线，且不能以数字开头！");
    }
    const min = game.core.__SIZE__;
    if (!isset(width) || !isset(height) || width < min || height < game.min || width * height > 1000) {
        throw new Error("新建地图的宽高都不得小于" + min + "，且宽高之积不能超过1000");
    }
}

////////////////////////// setter //////////////////////////

export const setBlock = function(mapid, pos, blockid) {

}

export const updateMapInfo = function(mapid, key, value) {
    return game.maps[mapid].modify({ key, value })
}

export const forceUpdateMap = function(mapid, map) {
    game.maps[mapid].data = map;
    return game.maps[mapid].data.save();
}

export const updateMapArray = function(mapid, [bgmap, map, fgmap]) {
    return game.maps[mapid].modify([
        { key: '[bgmap]', value: bgmap },
        { key: '[map]', value: map },
        { key: '[fgmap]', value: fgmap },
    ])
}

/**
 * 
 * @param {*} map 
 * @param {Pos} pos 
 * @param {String} field 
 * @param {*} value 
 */
export const modifyPos = function(map, pos, field, value) {
    const posstr = pos.format(",");
    if (!map[field]) map[field] = {};
    map[field][posstr] = clone(value);
    return map;
}

/**
 * 创建新地图
 * @param {*} from 地图来源信息 
 * @returns {Promise}
 */
export const createNewMap = function(from) {
    const map = Object.assign({}, editor.gameInfo.get("defaultMap"), from);
    checkMapInfo(map);
    const mapFile = new MapFile(map.floorId, clone(map));
    game.main.floorIds.push(map.floorId);
    game.main.floors.push(mapFile.data);
    game.maps[map.floorId] = mapFile;
    return mapFile.save()
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