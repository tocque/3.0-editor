/**
 * block_config.js Blockly块的配置
 */

export const blockList = function() {
    return {
        '入口方块':[
            MotaActionFunctions.actionParser.parse([
                "欢迎使用事件编辑器",
                "本事件触发一次后会消失",
                {"type": "hide", "time": 500},
            ],'event'),
            MotaActionFunctions.actionParser.parse({
                "condition": "flag:__door__==2",
                "currentFloor": true,
                "priority": 0,
                "delayExecute": false,
                "multiExecute": false,
                "data": [
                    {"type": "openDoor", "loc": [10,5]}
                ],
            },'autoEvent'),
            MotaActionBlocks['changeFloor_m'].xmlText(),
            MotaActionFunctions.actionParser.parse([{
                "id": "moneyShop1",
                "name": "贪婪之神", 
                "icon": "blueShop",
                "textInList": "1F金币商店", 
                "use": "money",
                "need": "20+10*times*(times+1)",  
                "text": "勇敢的武士啊，给我\\\${need}金币就可以：", 
                "choices": [ 
                    {"text": "生命+800", "effect": "status:hp+=800"},
                    {"text": "攻击+4", "effect": "status:atk+=4"},
                ]
            },{
                "id": "itemShop",
                "item": true,
                "textInList": "道具商店",
                "choices": [
                    {"id": "yellowKey", "number": 10, "money": 10}
                ]
            },{
                "id": "keyShop1",
                "textInList": "回收钥匙商店",
                "commonEvent": "回收钥匙商店",
                "args": ""
            }],'shop'),
            MotaActionBlocks['afterBattle_m'].xmlText(),
            MotaActionBlocks['afterGetItem_m'].xmlText(),
            MotaActionBlocks['afterOpenDoor_m'].xmlText(),
            MotaActionBlocks['firstArrive_m'].xmlText(),
            MotaActionBlocks['eachArrive_m'].xmlText(),
            MotaActionBlocks['level_m'].xmlText(),
            MotaActionBlocks['commonEvent_m'].xmlText(),
            MotaActionBlocks['item_m'].xmlText(),
        ],
        '显示文字':[
            MotaActionBlocks['text_0_s'].xmlText(),
            MotaActionBlocks['text_1_s'].xmlText(),
            MotaActionBlocks['comment_s'].xmlText(),
            MotaActionBlocks['autoText_s'].xmlText(),
            MotaActionBlocks['scrollText_s'].xmlText(),
            MotaActionBlocks['setText_s'].xmlText(),
            MotaActionBlocks['tip_s'].xmlText(),
            MotaActionBlocks['win_s'].xmlText(),
            MotaActionBlocks['lose_s'].xmlText(),
            MotaActionBlocks['restart_s'].xmlText(),
            MotaActionBlocks['confirm_s'].xmlText(),
            MotaActionBlocks['choices_s'].xmlText([
                '选择剑或者盾','流浪者','man',
                MotaActionBlocks['choicesContext'].xmlText([
                    '剑','','',null,'',MotaActionFunctions.actionParser.parseList([{"type": "openDoor", "loc": [3,3]}]),
                    MotaActionBlocks['choicesContext'].xmlText([
                        '盾','','',null,'',MotaActionFunctions.actionParser.parseList([{"type": "openDoor", "loc": [9,3]}]),
                    ])
                ])
            ]),
        ],
        '显示图片': [
            MotaActionBlocks['showImage_s'].xmlText(),
            MotaActionBlocks['showImage_1_s'].xmlText(),
            MotaActionBlocks['hideImage_s'].xmlText(),
            MotaActionBlocks['showTextImage_s'].xmlText(),
            MotaActionBlocks['moveImage_s'].xmlText(),
            MotaActionBlocks['showGif_0_s'].xmlText(),
            MotaActionBlocks['showGif_1_s'].xmlText(),
        ],
        '数据相关':[
            MotaActionBlocks['addValue_s'].xmlText([
                MotaActionBlocks['idString_1_e'].xmlText(['status','生命']), '', false
            ]),
            MotaActionBlocks['setValue_s'].xmlText([
                MotaActionBlocks['idString_1_e'].xmlText(['status','生命']), '', false
            ]),
            MotaActionBlocks['setEnemy_s'].xmlText(),
            MotaActionBlocks['setFloor_s'].xmlText(),
            MotaActionBlocks['setGlobalAttribute_s'].xmlText(),
            MotaActionBlocks['setGlobalValue_s'].xmlText(),
            MotaActionBlocks['setGlobalFlag_s'].xmlText(),
            MotaActionBlocks['update_s'].xmlText(),
            MotaActionBlocks['moveHero_s'].xmlText(),
            MotaActionBlocks['jumpHero_s'].xmlText(),
            MotaActionBlocks['changeFloor_s'].xmlText(),
            MotaActionBlocks['changePos_0_s'].xmlText(),
            MotaActionBlocks['changePos_1_s'].xmlText(),
            MotaActionBlocks['battle_s'].xmlText(),
            MotaActionBlocks['useItem_s'].xmlText(),
            MotaActionBlocks['loadEquip_s'].xmlText(),
            MotaActionBlocks['unloadEquip_s'].xmlText(),
            MotaActionBlocks['openShop_s'].xmlText(),
            MotaActionBlocks['disableShop_s'].xmlText(),
            MotaActionBlocks['setHeroIcon_s'].xmlText(),
            MotaActionBlocks['follow_s'].xmlText(),
            MotaActionBlocks['unfollow_s'].xmlText(),
        ],
        '地图处理':[
            MotaActionBlocks['battle_1_s'].xmlText(),
            MotaActionBlocks['openDoor_s'].xmlText(),
            MotaActionBlocks['closeDoor_s'].xmlText(),
            MotaActionBlocks['show_s'].xmlText(),
            MotaActionBlocks['hide_s'].xmlText(),
            MotaActionBlocks['setBlock_s'].xmlText(),
            MotaActionBlocks['move_s'].xmlText(),
            MotaActionBlocks['jump_s'].xmlText(),
            MotaActionBlocks['showBgFgMap_s'].xmlText(),
            MotaActionBlocks['hideBgFgMap_s'].xmlText(),
            MotaActionBlocks['setBgFgBlock_s'].xmlText(),
            MotaActionBlocks['showFloorImg_s'].xmlText(),
            MotaActionBlocks['hideFloorImg_s'].xmlText(),
        ],
        '事件控制':[
            MotaActionBlocks['if_1_s'].xmlText(),
            MotaActionBlocks['if_s'].xmlText(),
            MotaActionFunctions.actionParser.parseList({"type": "switch", "condition": "判别值", "caseList": [
                {"action": [{"type": "comment", "text": "当判别值是值的场合执行此事件"}]},
                {"action": [], "nobreak": true},
                {"case": "default", "action": [{"type": "comment", "text": "当没有符合的值的场合执行default事件"}]},
            ]}),
            MotaActionBlocks['while_s'].xmlText(),
            MotaActionBlocks['dowhile_s'].xmlText(),
            MotaActionBlocks['break_s'].xmlText(),
            MotaActionBlocks['continue_s'].xmlText(),
            MotaActionBlocks['revisit_s'].xmlText(),
            MotaActionBlocks['exit_s'].xmlText(),
            MotaActionBlocks['trigger_s'].xmlText(),
            MotaActionBlocks['insert_1_s'].xmlText(),
            MotaActionBlocks['insert_2_s'].xmlText(),
        ],
        '特效':[
            MotaActionBlocks['sleep_s'].xmlText(),
            MotaActionBlocks['waitAsync_s'].xmlText(),
            MotaActionBlocks['vibrate_s'].xmlText(),
            MotaActionBlocks['animate_s'].xmlText(),
            MotaActionBlocks['setViewport_s'].xmlText(),
            MotaActionBlocks['moveViewport_s'].xmlText(),
            MotaActionBlocks['showStatusBar_s'].xmlText(),
            MotaActionBlocks['hideStatusBar_s'].xmlText(),
            MotaActionBlocks['showHero_s'].xmlText(),
            MotaActionBlocks['hideHero_s'].xmlText(),
            MotaActionBlocks['setCurtain_0_s'].xmlText(),
            MotaActionBlocks['setCurtain_1_s'].xmlText(),
            MotaActionBlocks['screenFlash_s'].xmlText(),
            MotaActionBlocks['setWeather_s'].xmlText(),
            MotaActionBlocks['callBook_s'].xmlText(),
            MotaActionBlocks['callSave_s'].xmlText(),
            MotaActionBlocks['autoSave_s'].xmlText(),
            MotaActionBlocks['callLoad_s'].xmlText(),
        ],
        '音效': [
            MotaActionBlocks['playBgm_s'].xmlText(),
            MotaActionBlocks['pauseBgm_s'].xmlText(),
            MotaActionBlocks['resumeBgm_s'].xmlText(),
            MotaActionBlocks['loadBgm_s'].xmlText(),
            MotaActionBlocks['freeBgm_s'].xmlText(),
            MotaActionBlocks['playSound_s'].xmlText(),
            MotaActionBlocks['stopSound_s'].xmlText(),
            MotaActionBlocks['setVolume_s'].xmlText(),
        ],
        '用户输入': [
            MotaActionBlocks['input_s'].xmlText(),
            MotaActionBlocks['input2_s'].xmlText(),
            MotaActionFunctions.actionParser.parseList({"type": "wait", "data": [
                {"case": "keyboard", "keycode": 13, "action": [{"type": "comment", "text": "当按下回车(keycode=13)时执行此事件"}]},
                {"case": "mouse", "px": [0,32], "py": [0,32], "action": [{"type": "comment", "text": "当点击地图左上角时执行此事件"}]},
            ]}),
        ],
        'UI绘制':[
            MotaActionBlocks['previewUI_s'].xmlText(),
            MotaActionBlocks['clearMap_s'].xmlText(),
            MotaActionBlocks['clearMap_1_s'].xmlText(),
            MotaActionBlocks['setAttribute_s'].xmlText(),
            MotaActionBlocks['fillText_s'].xmlText(),
            MotaActionBlocks['fillBoldText_s'].xmlText(),
            MotaActionBlocks['drawTextContent_s'].xmlText(),
            MotaActionBlocks['fillRect_s'].xmlText(),
            MotaActionBlocks['strokeRect_s'].xmlText(),
            MotaActionBlocks['drawLine_s'].xmlText(),
            MotaActionBlocks['drawArrow_s'].xmlText(),
            MotaActionBlocks['fillPolygon_s'].xmlText(),
            MotaActionBlocks['strokePolygon_s'].xmlText(),
            MotaActionBlocks['fillCircle_s'].xmlText(),
            MotaActionBlocks['strokeCircle_s'].xmlText(),
            MotaActionBlocks['drawImage_s'].xmlText(),
            MotaActionBlocks['drawImage_1_s'].xmlText(),
            MotaActionBlocks['drawIcon_s'].xmlText(),
            MotaActionBlocks['drawBackground_s'].xmlText(),
            MotaActionBlocks['drawSelector_s'].xmlText(),
            MotaActionBlocks['drawSelector_1_s'].xmlText(),
        ],
        '原生脚本':[
            MotaActionBlocks['function_s'].xmlText(),
            MotaActionBlocks['unknown_s'].xmlText(),
        ],
        '值块':[
            MotaActionBlocks['addValue_s'].xmlText([
                MotaActionBlocks['idString_1_e'].xmlText(['status','生命']), '', false
            ]),
            MotaActionBlocks['setValue_s'].xmlText([
                MotaActionBlocks['idString_1_e'].xmlText(['status','生命']), '', false
            ]),
            MotaActionBlocks['expression_arithmetic_0'].xmlText(),
            MotaActionBlocks['evFlag_e'].xmlText(),
            MotaActionBlocks['negate_e'].xmlText(),
            MotaActionBlocks['bool_e'].xmlText(),
            MotaActionBlocks['idString_e'].xmlText(),
            MotaActionBlocks['idString_1_e'].xmlText(),
            MotaActionBlocks['idString_2_e'].xmlText(),
            MotaActionBlocks['idString_3_e'].xmlText(),
            MotaActionBlocks['idString_4_e'].xmlText(),
            MotaActionBlocks['idString_5_e'].xmlText(),
            MotaActionBlocks['idString_6_e'].xmlText(),
            MotaActionBlocks['evalString_e'].xmlText(),
        ],
        '常见事件模板':[
            '<label text="检测音乐如果没有开启则系统提示开启"></label>',
            MotaActionFunctions.actionParser.parseList({"type": "if", "condition": "!core.musicStatus.bgmStatus",
                "true": [
                "\\t[系统提示]你当前音乐处于关闭状态，本塔开音乐游戏效果更佳"
                ],
                "false": []
            }),
            '<label text="商店购买属性/钥匙"></label>',
            MotaActionFunctions.actionParser.parse([{
                "type": "choices", "text": "\\t[老人,man]少年，你需要钥匙吗？\\n我这里有大把的！",
                "choices": [
                    {"text": "黄钥匙（\\\${9+flag:shop_times}金币）", "color": [255,255,0,1], "action": [
                        {"type": "if", "condition": "status:money>=9+flag:shop_times",
                            "true": [
                                {"type": "addValue", "name": "status:money", "value": "-(9+flag:shop_times)"},
                                {"type": "addValue", "name": "item:yellowKey", "value": "1"},
                            ],
                            "false": [
                                "\\t[老人,man]你的金钱不足！",
                                {"type": "revisit"}
                            ]
                        }
                    ]},
                    {"text": "蓝钥匙（\\\${18+2*flag:shop_times}金币）", "color": [0,0,255,1], "action": [
                    ]},
                    {"text": "离开", "action": [
                        {"type": "exit"}
                    ]}
                ]
            },
            {"type": "addValue", "name": "flag:shop_times", "value": "1"},
            {"type": "revisit"}
            ], 'event'),  
            '<label text="战前剧情"></label>',
            MotaActionFunctions.actionParser.parse({ 
                "trigger": "action", 
                "displayDamage": true, 
                "data": [ 
                    ' ... 战前剧情',
                    {"type": "battle", "id": "greenSlime"},
                    ' ... 战后剧情；请注意上面的强制战斗不会使怪物消失',
                    '需要下一句来调用{"type": "hide"}来隐藏事件',
                    {"type": "hide"},
                ]
            },'event'),
            '<label text="打怪掉落道具"></label>',
            MotaActionFunctions.actionParser.parse([
                '怪物变成了黄钥匙(黄钥匙idnum是21)',
                '打怪变成可对话的NPC: https://ckcz123.github.io/mota-js/#/event?id=%e6%89%93%e6%80%aa%e5%8f%98%e6%88%90%e5%8f%af%e5%af%b9%e8%af%9d%e7%9a%84npc%ef%bc%88%e6%80%aa%e7%89%a9-gtnpc%ef%bc%89',
                {"type": "setBlock", "number": 21}
            ],'afterBattle'),
            '<label text="打怪开门"></label>',
            MotaActionFunctions.actionParser.parse([
                {"type": "addValue", "name": "flag:__door__", "value": "1"},
                {"type": "if", "condition": "flag:__door__==2", 
                "true": [
                    {"type": "openDoor", "loc": [10,5]}
                ],
                "false": [] 
                },
            ],'afterBattle'),
            '<label text="杀死魔龙后隐藏其余图块"></label>',
            MotaActionFunctions.actionParser.parse([
                {"type": "function", "function": "function(){var x=core.status.event.data.x,y=core.status.event.data.y;if(core.isset(x)&&core.isset(y)){core.insertAction([{type:'hide',loc:[[x-1,y-2],[x,y-2],[x+1,y-2],[x-1,y-1],[x,y-1],[x+1,y-1],[x-1,y],[x+1,y]]}]);}}"},
            ],'afterBattle'),
            '<label text="获得圣水后变成墙"></label>',
            MotaActionFunctions.actionParser.parse({
                "trigger": "action", 
                "noPass": true, 
                "data": [
                {"type": "if", "condition": "flag:hasSuperPotion", 
                    "true": [], 
                    "false": [
                        {"type":"setValue", "name":"status:hp", "value":"status:hp*2"}, 
                        {"type":"setBlock", "number": 1}, 
                        {"type":"setValue", "name":"flag:hasSuperPotion", "value": "true"} 
                    ]
                }
                ]
            },'event'),
        ],
    }
}
