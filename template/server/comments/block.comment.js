/*
 * 表格配置项。
 * 在这里可以对表格中的各项显示进行配置，包括表格项、提示内容等内容。具体写法照葫芦画瓢即可。
 * 本配置项为怪物。
 */

export default {
    "_data": {
        "id": {
            "_leaf": true,
            "_type": "const",
            "_name": "图块ID",
            "_data": "图块ID"
        },
        "idnum": {
            "_leaf": true,
            "_type": "const",
            "_name": "地图编号",
            "_data": "图块数字"
        },
        "cls": {
            "_leaf": true,
            "_type": "const",
            "_name": "图块类别",
            "_data": "图块类别"
        },
        "name": {
            "_leaf": true,
            "_type": "text",
            "_string": true,
            "_name": "图块名称",
            "_data": "图块名称"
        },
        "trigger": {
            "_leaf": true,
            "_type": "select",
            "_name": "触发器",
            "_options": [
                "null",
                "openDoor",
                "passNet",
                "changeLight",
                "pushBox",
                "custom"
            ],
            "_data": "该图块的默认触发器"
        },
        "noPass": {
            "_leaf": true,
            "_type": "select",
            "_name": "不可通行",
            "_options": [
                "null",
                "true",
                "false"
            ],
            "_data": "该图块是否不可通行；true代表不可通行，false代表可通行，null代表使用系统缺省值"
        },
        "script": {
            "_leaf": true,
            "_type": "textarea",
            "_string": true,
            "_lint": true,
            "_name": "触碰脚本",
            "_data": "触碰到该图块时自动执行的脚本内容；此脚本会在该点的触发器执行前执行"
        },
        "cannotOut": {
            "_leaf": true,
            "_type": "textarea",
            "_unrequired": true,
            "_range": (v) => Array.isArray(v),
            "_name": "不可出方向",
            "_data": "该图块的不可出方向\n可以在这里定义在该图块时不能前往哪个方向，可以达到悬崖之类的效果\n例如 [\"up\", \"left\"] 代表在该图块时不能往上和左走\n此值对背景层、事件层、前景层上的图块均有效"
        },
        "cannotIn": {
            "_leaf": true,
            "_type": "textarea",
            "_unrequired": true,
            "_range": (v) => Array.isArray(v),
            "_name": "不可入方向",
            "_data": "该图块的不可入方向\n可以在这里定义不能朝哪个方向进入该图块，可以达到悬崖之类的效果\n例如 [\"down\"] 代表不能从该图块的上方点朝向下进入此图块\n此值对背景层、事件层、前景层上的图块均有效"
        },
        "canBreak": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "可破坏",
            "_data": "该图块是否可被破墙或地震"
        },
        "animate": {
            "_leaf": true,
            "_type": "number",
            "_unrequired": true,
            "_name": "全局动画帧数",
            "_data": "该图块的全局动画帧数。\n如果此项为null，则对于除了npc48外，使用素材默认帧数；npc48默认是1帧（即静止）。"
        },
        "faceIds": {
            "_leaf": true,
            "_type": "textarea",
            "_hide": (args, data) => !data.cls.startsWith("npc"),
            "_name": "行走图朝向",
            "_data": "行走图朝向，仅对NPC有效。可以在这里定义同一个NPC的多个朝向行走图。\n比如 {\"up\":\"N333\",\"down\":\"N334\",\"left\":\"N335\",\"right\":\"N336\"} 就将该素材的上下左右朝向分别绑定到N333,N334,N335和N336四个图块。\n在勇士撞上NPC时，或NPC在移动时，会自动选择最合适的朝向图块（如果存在定义）来进行绘制。"
        }
    }
}