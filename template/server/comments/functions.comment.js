/*
 * 表格配置项。
 * 在这里可以对表格中的各项显示进行配置，包括表格项、提示内容等内容。具体写法照葫芦画瓢即可。
 * 本配置项为脚本编辑。
 */

export default {
	"_type": "object",
	"_data": {
		"events": {
			"_type": "object",
			"_data": {
				"resetGame": {
					"_leaf": true,
					"_type": "script",
					"_data": "重置整个游戏"
				},
				"setInitData": {
					"_leaf": true,
					"_type": "script",
					"_data": "设置初始属性"
				},
				"win": {
					"_leaf": true,
					"_type": "script",
					"_data": "游戏获胜事件"
				},
				"lose": {
					"_leaf": true,
					"_type": "script",
					"_data": "游戏失败事件"
				},
				"changingFloor": {
					"_leaf": true,
					"_type": "script",
					"_data": "切换楼层中"
				},
				"afterChangeFloor": {
					"_leaf": true,
					"_type": "script",
					"_data": "切换楼层后"
				},
				"flyTo": {
					"_leaf": true,
					"_type": "script",
					"_data": "楼层飞行"
				},
				"beforeBattle": {
					"_leaf": true,
					"_type": "script",
					"_data": "战前事件"
				},
				"afterBattle": {
					"_leaf": true,
					"_type": "script",
					"_data": "战后事件"
				},
				"afterOpenDoor": {
					"_leaf": true,
					"_type": "script",
					"_data": "开门后事件"
				},
				"afterGetItem": {
					"_leaf": true,
					"_type": "script",
					"_data": "获得道具后事件"
				},
				"afterChangeLight": {
					"_leaf": true,
					"_type": "script",
					"_data": "改变亮灯事件"
				},
				"afterPushBox": {
					"_leaf": true,
					"_type": "script",
					"_data": "推箱子事件"
				},
				"afterUseBomb": {
					"_leaf": true,
					"_type": "script",
					"_data": "炸弹事件"
				},
				"afterPassNet": {
					"_leaf": true,
					"_type": "script",
					"_data": "经过特殊地形后的事件"
				},
				"canUseQuickShop": {
					"_leaf": true,
					"_type": "script",
					"_data": "能否用快捷商店"
				}
			}
		},
		"enemys": {
			"_type": "object",
			"_data": {
				"getSpecials": {
					"_leaf": true,
					"_type": "script",
					"_data": "怪物特殊属性定义"
				},
				"getEnemyInfo": {
					"_leaf": true,
					"_type": "script",
					"_data": "获得怪物真实属性"
				},
				"getDamageInfo": {
					"_leaf": true,
					"_type": "script",
					"_data": "获得战斗伤害信息"
				}
			}
		},
		"actions": {
			"_type": "object",
			"_data": {
				"onKeyUp": {
					"_leaf": true,
					"_type": "script",
					"_data": "按键处理"
				},
				"onStatusBarClick": {
					"_leaf": true,
					"_type": "script",
					"_data": "状态栏点击事件，仅在开启自绘状态栏时生效"
				}
			}
		},
		"control": {
			"_type": "object",
			"_data": {
				"saveData": {
					"_leaf": true,
					"_type": "script",
					"_data": "存档操作"
				},
				"loadData": {
					"_leaf": true,
					"_type": "script",
					"_data": "读档操作"
				},
				"updateStatusBar": {
					"_leaf": true,
					"_type": "script",
					"_data": "更新状态栏"
				},
				"updateCheckBlock": {
					"_leaf": true,
					"_type": "script",
					"_data": "阻激夹域伤害"
				},
				"moveOneStep": {
					"_leaf": true,
					"_type": "script",
					"_data": "每一步后的操作"
				},
				"moveDirectly": {
					"_leaf": true,
					"_type": "script",
					"_data": "瞬间移动处理"
				},
				"parallelDo": {
					"_leaf": true,
					"_type": "script",
					"_data": "并行事件处理"
				}
			}
		},
		"ui": {
			"_type": "object",
			"_data": {
				"drawStatusBar": {
					"_leaf": true,
					"_type": "script",
					"_data": "自绘状态栏"
				},
				"drawStatistics": {
					"_leaf": true,
					"_type": "script",
					"_data": "地图数据统计"
				},
				"drawAbout": {
					"_leaf": true,
					"_type": "script",
					"_data": "绘制关于界面"
				}
			}
		}
	}
}