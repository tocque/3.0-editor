"use strict";
/**
 * editor_game.js 游戏运行时
 */
var editor_game_wrapper = function (editor, callback) {
    
    return new class game { 

        data = {};

        constructor(callback) {
            const loadList = [
                'loader', 'control', 'utils', 'items', 'icons','sprite', 'scenes', 'maps', 'enemys', 'events', 'actions', 'data', 'ui', 'core'
            ];
            const pureData = [ 
                'data', 'enemys', 'icons', 'maps', 'items', 'functions', 'events', 'plugins', 'sprite',
            ];
            let _this = this;
            editor.loadJsByList('project', pureData, function() {
                var mainData = data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.main;
                for(let key in mainData) _this.data[key] = mainData[key];
                
                editor.loadJsByList('libs', loadList, function () {
                    _this.core = core;
                    for (let js of loadList) {
                        if (js === 'core') continue;
                        _this.core[js] = new window[js]();
                    }
                    callback();
                });
            });
        }

        // 绘制地图
        drawFloor() {

        }

    }(callback);
}