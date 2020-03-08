export default {
    "_type": "object",
    "_data": {
        "events": {
            "_leaf": true,
            "_type": "event",
            "_event": "event",
            "_name": "可能事件列表",
            "_data": "该点的可能事件列表，可以双击进入事件编辑器。"
        },
        "autoEvent": {
            "_type": "object",
            "_leaf": false,
            "_action": function (args) {
                args.vobj = args.vobj || {};
                for(var ii = 0; ii < 2; ii++) {
                    args.vobj[ii] = args.vobj[ii] || null;
                }
            },
            "_data": function (key) {
                return {
                    "_leaf": true,
                    "_type": "event",
                    "_event": "autoEvent",
                    "_data": "自动事件页"
                }
            }
        },
        "changeFloor": {
            "_leaf": true,
            "_type": "event",
            "_event": "changeFloor",
            "_name": "楼层转换事件",
            "_data": "该点楼层转换事件；该事件不能和上面的events同时出现，否则会被覆盖"
        },
        "afterBattle": {
            "_leaf": true,
            "_type": "event",
            "_event": "afterBattle",
            "_name": "战后事件",
            "_data": "该点战斗后可能触发的事件列表，可以双击进入事件编辑器。"
        },
        "afterGetItem": {
            "_leaf": true,
            "_type": "event",
            "_event": "afterGetItem",
            "_name": "获取道具后事件",
            "_data": "该点获得道具后可能触发的事件列表，可以双击进入事件编辑器。"
        },
        "afterOpenDoor": {
            "_leaf": true,
            "_type": "event",
            "_event": "afterOpenDoor",
            "_name": "开门后事件",
            "_data": "该点开完门后可能触发的事件列表，可以双击进入事件编辑器。"
        },
        "cannotMove": {
            "_leaf": true,
            "_type": "textarea",
            "_range": "thiseval==null||(thiseval instanceof Array)",
            "_name": "通行性设置",
            "_data": "该点不可通行的方向 \n 可以在这里定义该点不能前往哪个方向，可以达到悬崖之类的效果\n例如 [\"up\", \"left\"] 代表该点不能往上和左走"
        },
    }
}