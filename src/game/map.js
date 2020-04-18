/**
 * @file game/map.js 游戏地图相关的接口
 */
import game from "../game.js";
import { isset, clone, createGuid } from "../utils.js";
import { ftools, JsonFile } from "../file.js";
import locComment from "../comments/loc.comment.js";

export class MapFile extends JsonFile {
    /**
     * 地图文件的类
     * @param {String} baseUrl
     * @param {String} mapid
     * @param {*} data
     * @memberof MapFile
     */
    constructor(baseUrl, mapid, data, defaultMap) {
        super(`${baseUrl}/project/floors/${mapid}.js`, data, {
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
            },
            defaultMap,
        });
        this.addEmitter('afterSave', function(h, str) {
            game.data.addUsedFlags(str);
        });
    }
}

export let fgmap = [], bgmap = [];
/**
 * @typedef {Object} Block
 * @property {"terrains"|"item"|"npc"|"npc48"|"enemys"|"enemy48"|"animate"|"autotiles"} cls 图块类别
 * @property {String} id
 */


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
    if (!isset(map.width) || !isset(map.height) || map.width < min || map.height < game.min) {
        throw new Error("新建地图的宽高都不得小于" + min);
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
    const map = Object.assign({}, editor.gameInfo.get("default.map"), from);
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