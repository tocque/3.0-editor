/*
 * 表格配置项。
 * 在这里可以对表格中的各项显示进行配置，包括表格项、提示内容等内容。具体写法照葫芦画瓢即可。
 * 本配置项为楼层属性。
 */

export default {
    "_type": "object",
    "_data": {
        "floorId": {
            "_leaf": true,
            "_type": "const",
            "_name": "楼层ID",
            "_data": "文件名和floorId需要保持完全一致 \n楼层唯一标识符仅能由字母、数字、下划线组成，且不能由数字开头 \n推荐用法：第20层就用MT20，第38层就用MT38，地下6层就用MT_6（用下划线代替负号），隐藏3层用MT3h（h表示隐藏），等等 \n楼层唯一标识符，需要和名字完全一致 \n这里不能更改floorId,请通过另存为来实现"
        },
        "title": {
            "_leaf": true,
            "_type": "text",
            "_name": "楼层名称",
            "_data": "楼层中文名，将在切换楼层和浏览地图时显示"
        },
        "name": {
            "_leaf": true,
            "_type": "text",
            "_name": "层数",
            "_data": "显示在状态栏中的层数"
        },
        "width": {
            "_leaf": true,
            "_type": "const",
            "_name": "地图宽度",
            "_data": "地图x方向大小,这里不能更改,仅能在新建地图时设置,null视为13"
        },
        "height": {
            "_leaf": true,
            "_type": "const",
            "_name": "地图高度",
            "_data": "地图y方向大小,这里不能更改,仅能在新建地图时设置,null视为13"
        },
        "canFlyTo": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "允许楼传",
            "_data": "该楼能否被楼传器飞到（不能的话在该楼也不允许使用楼传器）"
        },
        "canUseQuickShop": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "允许商店",
            "_data": "该层是否允许使用快捷商店"
        },
        "cannotViewMap": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "禁止浏览",
            "_data": "该层是否不允许被浏览地图看到；如果勾上则浏览地图会跳过该层"
        },
        "cannotMoveDirectly": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "禁止瞬移",
            "_data": "该层是否不允许瞬间移动；如果勾上则不可在此层进行瞬移"
        },
        "firstArrive": {
            "_leaf": true,
            "_type": "event",
            "_event": "firstArrive",
            "_name": "初次到达事件",
            "_data": "第一次到该楼层触发的事件，可以双击进入事件编辑器。"
        },
        "eachArrive": {
            "_leaf": true,
            "_type": "event",
            "_event": "eachArrive",
            "_name": "每次到达事件",
            "_data": "每次到该楼层触发的事件，可以双击进入事件编辑器；该事件会在firstArrive执行后再执行。"
        },
        "parallelDo": {
            "_leaf": true,
            "_type": "textarea",
            "_string": true,
            "_lint": true,
            "_name": "并行事件",
            "_data": "在该层楼时执行的并行事件处理。\n可以在这里写上任意需要自动执行的脚本，比如打怪自动开门等。\n详见文档-事件-并行事件处理。"
        },
        "upFloor": {
            "_leaf": true,
            "_type": "text",
            "_name": "上楼点",
			"_unrequired": true,
            "_range": (v) => Array.isArray(v) && v.length==2,
            "_data": "该层上楼点，如[2,3]。\n如果此项不为null，则楼层转换时的stair:upFloor，以及楼传器的落点会被替换成该点而不是该层的上楼梯。"
        },
        "downFloor": {
            "_leaf": true,
            "_type": "text",
            "_name": "下楼点",
			"_unrequired": true,
            "_range": (v) => Array.isArray(v) && v.length==2,
            "_data": "该层下楼点，如[2,3]。\n如果此项不为null，则楼层转换时的stair:downFloor，以及楼传器的落点会被替换成该点而不是该层的下楼梯。"
        },
        "defaultGround": {
            "_leaf": true,
            "_type": "select",
            "_name": "地面图块",
            "_options": () => Object.keys(core.icons.icons.terrains),
            "_data": "默认地面的图块ID，此项修改后需要刷新才能看到效果。"
        },
        "images": {
            "_leaf": true,
            "_type": "textarea",
            "_name": "背景/前景图",
            "_data": "背景/前景图；你可以选择若干张图片来作为背景/前景素材。详细用法请参见文档“自定义素材”中的说明。"
        },
        "color": {
            "_leaf": true,
            "_type": "color",
            "_alpha": true,
            "_parse": "array",
            "_name": "画面色调",
            "_data": "该层的默认画面色调。本项可不写（代表无色调），如果写需要是一个RGBA数组如[255,0,0,0.3]"
        },
        "weather": {
            "_leaf": true,
            "_type": "text",
            "_name": "天气",
            "_data": "该层的默认天气。本项可忽略表示晴天，如果写则第一项为\"rain\"，\"snow\"或\"fog\"代表雨雪雾，第二项为1-10之间的数代表强度。\n如[\"rain\", 8]代表8级雨天。"
        },
        "bgm": {
            "_leaf": true,
            "_type": "select",
            "_options": () => [null].concat(core.loadList.bgms),
            "_name": "BGM",
            "_data": "到达该层后默认播放的BGM。本项可忽略，或者为一个定义过的背景音乐如\"bgm.mp3\"。"
        },
        "item_ratio": {
            "_leaf": true,
            "_type": "number",
            "_name": "宝石/血瓶倍率",
            "_min": 0,
            "_data": "每一层的宝石/血瓶效果，即获得宝石和血瓶时框内\"ratio\"的值。"
        },
        "underGround": {
            "_leaf": true,
            "_type": "checkbox",
            "_bool": "bool",
            "_name": "地下层",
            "_data": "是否是地下层；如果该项为true则同层传送将传送至上楼梯"
        },
        "map": {
            "_hide": true,
        },
        "fgmap": {
            "_hide": true,
        },
        "bgmap": {
            "_hide": true,
        },
        "events": {
            "_hide": true,
        },
        "changeFloor": {
            "_hide": true,
        },
        "afterBattle": {
            "_hide": true,
        },
        "afterGetItem": {
            "_hide": true,
        },
        "afterOpenDoor": {
            "_hide": true,
        },
        "autoEvent": {
            "_hide": true,
        },
        "cannotMove": {
            "_hide": true,
        }
    },
}