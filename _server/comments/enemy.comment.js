/*
 * 表格配置项。
 * 在这里可以对表格中的各项显示进行配置，包括表格项、提示内容等内容。具体写法照葫芦画瓢即可。
 * 本配置项为怪物。
 */

export default {
	"_type": "object",
	"_data": {
		"name": {
			"_leaf": true,
			"_type": "textarea",
			"_string": true,
			"_data": "名称"
		},
		"displayIdInBook": {
			"_leaf": true,
			"_type": "textarea",
			"_string": true,
			"_data": "在怪物手册中映射到的怪物ID。如果此项不为null，则在怪物手册中，将用目标ID来替换该怪物原本的ID。\n此项应被运用在同一个怪物的多朝向上。\n例如，如果想定义同一个怪物的向下和向左的行走图，则需要建立两个属性完全相同的怪物。\n但是这样会导致在怪物手册中同时存在向下和向左的两种怪物的显示。\n可以将朝向左的怪物的displayIdInBook项指定为朝向下的怪物ID，这样在怪物手册中则会归一化，只显示一个。"
		},
		"hp": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "生命值"
		},
		"atk": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "攻击力"
		},
		"def": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "防御力"
		},
		"money": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "金币"
		},
		"experience": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "经验"
		},
		"point": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "加点"
		},
		"special": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "thiseval==null || thiseval instanceof Array || (thiseval==~~thiseval && thiseval>=0)",
			"_data": "特殊属性\n\n0:无,1:先攻,2:魔攻,3:坚固,4:2连击,\n5:3连击,6:n连击,7:破甲,8:反击,9:净化,\n10:模仿,11:吸血,12:中毒,13:衰弱,14:诅咒,\n15:领域,16:夹击,17:仇恨,18:阻击,19:自爆,\n20:无敌,21:退化,22:固伤,23:重生,24:激光,25:光环\n\n多个属性例如用[1,4,11]表示先攻2连击吸血"
		},
		"value": {
			"_leaf": true,
			"_type": "textarea",
			"_data": "特殊属性的数值\n如：领域/阻激/激光怪的伤害值；吸血怪的吸血比例；光环怪增加生命的比例"
		},
		"zoneSquare": {
			"_leaf": true,
			"_type": "checkbox",
			"_bool": "bool",
			"_data": "领域怪是否九宫格伤害"
		},
		"range": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "(thiseval==~~thiseval && thiseval>0)||thiseval==null",
			"_data": "领域伤害的范围；不加默认为1"
		},
		"notBomb": {
			"_leaf": true,
			"_type": "checkbox",
			"_bool": "bool",
			"_data": "该怪物不可被炸"
		},
		"n": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "(thiseval==~~thiseval && thiseval>0)||thiseval==null",
			"_data": "多连击的连击数"
		},
		"add": {
			"_leaf": true,
			"_type": "checkbox",
			"_bool": "bool",
			"_data": "吸血后是否加到自身；光环是否叠加"
		},
		"atkValue": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "thiseval==~~thiseval||thiseval==null",
			"_data": "退化时勇士下降的攻击力点数；光环怪增加攻击的比例"
		},
		"defValue": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "thiseval==~~thiseval||thiseval==null",
			"_data": "退化时勇士下降的防御力点数；光环怪增加防御的比例"
		},
		"damage": {
			"_leaf": true,
			"_type": "textarea",
			"_range": "thiseval==~~thiseval||thiseval==null",
			"_data": "战前扣血的点数"
		}
	},
	template: {
		'name': '新敌人','hp': 0, 'atk': 0, 'def': 0, 'money': 0, 'experience': 0, 'point': 0, 'special': 0
	},
}