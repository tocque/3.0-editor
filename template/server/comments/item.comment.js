/*
 * 表格配置项。
 * 在这里可以对表格中的各项显示进行配置，包括表格项、提示内容等内容。具体写法照葫芦画瓢即可。
 * 本配置项为道具
 */

export default {
    "_type": "object",
    "_data": {
        "items": {
            "_type": "object",
            "_name": "物品属性",
            "_data": {
                "cls": {
                    "_leaf": true,
                    "_type": "select",
                    "_options": [
                        "keys",
                        "items",
                        "constants",
                        "tools",
                        "equips"
                    ],
                    "_name": "类别",
                    "_data": "只能取keys(钥匙) items(宝石、血瓶) constants(永久物品) tools(消耗道具) equips(装备)"
                },
                "name": {
                    "_leaf": true,
                    "_type": "text",
                    "_string": true,
                    "_name": "名称",
                    "_data": "名称"
                },
                "text": {
                    "_leaf": true,
                    "_type": "textarea",
                    "_string": true,
                    "_name": "描述",
                    "_data": "道具在道具栏中显示的描述"
                },
                "equip": {
                    "_leaf": true,
                    "_type": "textarea",
                    "_hide": (args, data) => data.items.cls != "equips",
                    "_name": "属性",
                    "_data": "装备属性设置，仅对cls为equips有效。\n如果此项不为null，需要是一个对象，里面可含\"type\"，\"atk\"，\"def\"，\"mdef\"，\"animate\"五项，分别对应装备部位、攻防魔防和动画。\n具体详见文档（元件说明-装备）和已有的几个装备的写法。"
                },
                "hideInReplay": {
                    "_leaf": true,
                    "_type": "checkbox",
                    "_bool": "bool",
                    "_name": "回放时显示",
                    "_data": "是否回放时绘制道具栏。\n如果此项为true，则在回放录像时使用本道具将不会绘制道具栏页面，而是直接使用。\n此项建议在会频繁连续多次使用的道具开启（如开启技能，或者《镜子》那样的镜像切换等等）"
                }
            }
        },
        "itemEffect": {
            "_leaf": true,
            "_type": "script",
            "_hide": (args, data) => data.items.cls != "items",
            "_string": true,
            "_lint": true,
            "_name": "道具效果",
            "_data": "即捡即用类物品的效果，仅对cls为items有效。"
        },
        "itemEffectTip": {
            "_leaf": true,
            "_type": "textarea",
            "_hide": (args, data) => data.items.cls != "items",
            "_string": true,
            "_lint": true,
            "_name": "获得时提示",
            "_data": "即捡即用类物品在获得时提示的文字，仅对cls为items有效。"
        },
        "useItemEffect": {
            "_leaf": true,
            "_type": "script",
            "_hide": (args, data) => !["tools", "constants"].includes(data.items.cls),
            "_string": true,
            "_lint": true,
            "_name": "道具使用效果",
            "_data": "道具效果，仅对cls为tools或constants有效。"
        },
        "canUseItemEffect": {
            "_leaf": true,
            "_type": "script",
            "_hide": (args, data) => !["tools", "constants"].includes(data.items.cls),
            "_string": true,
            "_lint": true,
            "_name": "使用条件",
            "_data": "当前能否使用该道具，仅对cls为tools或constants有效。"
        },
        "equipCondition": {
            "_leaf": true,
            "_type": "script",
            "_hide": (args, data) => data.items.cls != "wquips",
            "_string": true,
            "_lint": true,
            "_name": "装备条件",
            "_data": "能装备某个装备的条件，仅对cls为equips有效。\n与canUseItemEffect不同，这里null代表可以装备。"
        }
    }
}