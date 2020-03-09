/**
 * @file game/data.js 游戏数据相关的接口
 */
import game from "../editor_game.js";
import { Converter } from "../blockly/Converter.bundle.min.js";
import { clone } from "../editor_util.js";

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
 * 获取工程名称
 * @returns {String}
 */
export const getCommonEvents = function() {
    return game.oriData.events.commonEvent;
}

////////////////////////// setter //////////////////////////


////////////////////////// wrapapi //////////////////////////
