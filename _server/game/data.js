/**
 * @file game/data.js 游戏数据相关的接口
 */
import game from "../editor_game.js";
import { isset, clone } from "../editor_util.js";
import itemComment from "../comments/item.comment.js";
import enemyComment from "../comments/enemy.comment.js";
import blockComment from "../comments/block.comment.js";

/**
 * @typedef {Object} Enemy
 * @property {String} name 名称
 */


export const init = function() {
     
}

////////////////////////// getter //////////////////////////

/** 
 * 获取工程名称
 * @returns {String}
 */
export const getProjectName = function() {
    return game.oriData.data.firstData.title;
}

/** 
 * 获取初始地点
 * @param {String} [option] 只获取特定的属性
 */
export const getStartpos = function(option) {
    const firstData = game.oriData.data.firstData;
    if (option == "floorId") {
        return firstData.floorId;
    } else if (option) {
        return firstData.hero.loc;
    }
    return Object.assign({}, firstData.hero.loc, {floorId: firstData.floorId});
}

/** 
 * 获取公共事件列表
 * @returns
 */
export const getCommonEvents = function() {
    return game.oriData.events.commonEvent;
}

/**
 * @param {String} id
 * @returns {[Enemy, Object]}
 */
export const getEnemyData = function(id) {
    const enemy = Object.assign({}, game.oriData.enemys[id]);
    Object.keys(enemyComment._data).forEach((v) => {
        if (!isset(enemy[v])) enemy[v] = null;
    });
    return [enemy, enemyComment];
}

export const getItemData = function(id) {
    const item = {};
    Object.keys(itemComment._data).forEach((v) => {
        if (isset(game.oriData.items[v][id]) && v !== 'items')
            item[v] = game.oriData.items[v][id];
        else
            item[v] = null;
    });
    item['items'] = (() => {
        const locObj = Object.assign({}, game.oriData.items.items[id]);
        Object.keys(itemComment._data.items._data).forEach((v) => {
            if (!isset(locObj[v])) locObj[v] = null;
        });
        return locObj;
    })();
    return [item, itemComment];
}

export const getBlockData = function(idnum) {
    const sourceobj = game.oriData.maps[idnum];
    // tileset默认生成空块
    if(!isset(sourceobj) && idnum >= game.core.icons.tilesetStartOffset) {
        sourceobj = { "cls": "tileset", "id": "X"+idnum, "noPass": true }
    }
    const block = Object.assign({}, sourceobj);
    Object.keys(blockComment._data).forEach((v) => {
        if (!isset(sourceobj[v])) block[v] = null;
    });
    block.idnum = idnum;
    return [block, blockComment];
}

export const getTowerData = function() {
    return clone(game.oriData.data);
}


////////////////////////// setter //////////////////////////

export const updateTowerData = function(key, value) {
    return game.gameData.data.modify({ key, value });
}

export const updateEnemyData = function(id, key, value) {
    return game.gameData.enemys.modify({ key: `[${id}]${key}`, value });
}

export const updateItemData = function(id, key, value) {
    return game.gameData.items.modify({ key: `[${id}]${key}`, value });
}

export const updateBlockData = function(id, key, value) {
    const number = game.apply("getNumberById", id);
    return game.gameData.maps.modify({ key: `[${number}]${key}`, value });
}

////////////////////////// wrapapi //////////////////////////
