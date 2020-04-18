import { isset } from "../utils.js"

class ActionParser {
    parse(obj, type) {
        switch (type) {
        case 'event':
            if (!obj) obj={};
            if (typeof(obj)===typeof('')) obj={'data':[obj]};
            if (Array.isArray(obj)) obj={'data':obj};
            return MotaActionBlocks['event_m'].xmlText([
                obj.trigger==='action',obj.enable,obj.noPass,obj.displayDamage,this.parseList(obj.data)
            ]);
        
        case 'autoEvent':
            if (!obj) obj={};
            return MotaActionBlocks['autoEvent_m'].xmlText([
                obj.condition,obj.priority,obj.currentFloor,obj.delayExecute,obj.multiExecute,this.parseList(obj.data)
            ]);
        
        case 'changeFloor':
            if(!obj)obj={};
            if(!isset(obj.loc)) {
                obj.loc=[0,0];
                if (!isset(obj.stair)) obj.stair=':now';
            }
            if (obj.floorId==':before'||obj.floorId==':next') {
                obj.floorType=obj.floorId;
                delete obj.floorId;
            }
            if (!isset(obj.time)) obj.time=500;
            return MotaActionBlocks['changeFloor_m'].xmlText([
                obj.floorType||'floorId',obj.floorId,obj.stair||'loc',obj.loc[0],obj.loc[1],obj.direction,
                obj.time,!isset(obj.ignoreChangeFloor)
            ]);
    
        case 'level': {
            if(!obj)obj={};
            let text_choices = null;
            for(let ii=obj.length-1,choice; choice=obj[ii]; ii--) {
                text_choices=MotaActionBlocks['levelCase'].xmlText([
                    MotaActionBlocks['evalString_e'].xmlText([choice.need]),
                    choice.title,choice.clear||false,this.parseList(choice.action),text_choices
                ]);
            }
            return MotaActionBlocks['level_m'].xmlText([text_choices]);
        }
        case 'shop': {
            const buildsub = function(obj,parser,next){
                let text_choices = null;
                for(let ii=obj.choices.length-1,choice; choice=obj.choices[ii];ii--) {
                    let text_effect = null;
                    const effectList = choice.effect.split(';');
                    for(let jj=effectList.length-1,effect;effect=effectList[jj];jj--) {
                        if(effect.split('+=').length!==2){
                            throw new Error('一个商店效果中必须包含恰好一个"+="');
                        }
                        text_effect=MotaActionBlocks['shopEffect'].xmlText([
                            MotaActionBlocks['idString_e'].xmlText([effect.split('+=')[0]]),
                            MotaActionBlocks['evalString_e'].xmlText([effect.split('+=')[1]]),
                            text_effect
                        ]);
                    }
                    text_choices=MotaActionBlocks['shopChoices'].xmlText([
                    choice.text,choice.need||'',text_effect,text_choices]);
                }
                return MotaActionBlocks['shopsub'].xmlText([
                    obj.id,obj.name,obj.icon,obj.textInList,obj.commonTimes,obj.mustEnable,obj.use,obj.need,parser.EvalString(obj.text),text_choices,next
                ]);
            }
            const buildcommentevent = function(obj,parser,next){
            if (obj.args instanceof Array) {
                try { obj.args = JSON.stringify(obj.args).replace(/"/g, "'"); }
                catch (e) {obj.args = '';}
            }
            else obj.args = null;
            return MotaActionBlocks['shopcommonevent'].xmlText([
                obj.id,parser.EvalString(obj.textInList),obj.mustEnable,parser.EvalString(obj.commonEvent),obj.args,next
            ]);
            }
            const builditem = function (obj,parser,next){
                let text_choices = null;
                for(let ii=obj.choices.length-1,choice;choice=obj.choices[ii];ii--) {
                    text_choices = MotaActionBlocks['shopItemChoices'].xmlText([
                    choice.id, choice.number == null ? "" : (""+choice.number), choice.money == null ? "" : (""+choice.money), 
                    choice.sell == null ? "" : (""+choice.sell), choice.condition || "", text_choices
                    ]);
                }
                return MotaActionBlocks['shopitem'].xmlText([
                    obj.id,obj.textInList,obj.mustEnable,text_choices,next
                ]);
            }
            let next = null;
            if(!obj) obj=[];
            while(obj.length) {
                const shopobj=obj.pop()
                if(shopobj.item)
                    next=builditem(shopobj,this,next);
                else if(shopobj.choices)
                    next=buildsub(shopobj,this,next);
                else if(shopobj.commonEvent)
                    next=buildcommentevent(shopobj,this,next);
                else
                    throw new Error("[警告]出错啦！\n"+shopobj.id+" 无效的商店");
            }
            return MotaActionBlocks['shop_m'].xmlText([next]);
        }
        default:
            return MotaActionBlocks[type+'_m'].xmlText([this.parseList(obj)]);
        }
    }

    /** 开始解析一系列自定义事件 */
    parseList = function (list) {
        if (!isset(list)) return MotaActionBlocks['pass_s'].xmlText([],true);
        if (!(list instanceof Array)) {
            list = [list];
        }
        if (list.length===0) return MotaActionBlocks['pass_s'].xmlText([],true);
        this.event = {'id': 'action', 'data': {
            'list': list
        }}
        this.next = null;
        this.result = null;
        this.parseAction();
        return this.result;
    }

    /** 解析当前自定义事件列表中的最后一个事件 */
    parseAction() {

        // 事件处理完毕
        if (this.event.data.list.length==0) {
          this.result = this.next;
          this.next = null;
          return;
        }
      
        let data = this.event.data.list.pop();
        this.event.data.current = data;
      
        // 不同种类的事件
      
        // 如果是文字：显示
        if (typeof data == "string") {
            data={"type": "text", "text": data}
        }
        this.event.data.type=data.type;
        switch (data.type) {
            case "_next":
                this.result = this.next;
                this.next = data.next;
                return;
            case "text": { // 文字/对话
                const info = this.getTitleAndPosition(data.text);
                if (info[0] || info[1] || info[2]) {
                this.next = MotaActionBlocks['text_1_s'].xmlText([
                    info[0], info[1], info[2], info[3], this.next]);
                }
                else {
                this.next = MotaActionBlocks['text_0_s'].xmlText([info[3],this.next]);
                }
                break;
            }
            case "autoText": { // 自动剧情文本
                const info = this.getTitleAndPosition(data.text);
                this.next = MotaActionBlocks['autoText_s'].xmlText([
                info[0],info[1],info[2],data.time,info[3],this.next]);
                break;
            }
            case "scrollText":
                this.next = MotaActionBlocks['scrollText_s'].xmlText([
                data.time, data.lineHeight||1.4, data.async||false, this.EvalString(data.text), this.next]);
                break;
            case "comment": // 注释
                this.next = MotaActionBlocks['comment_s'].xmlText([this.EvalString(data.text),this.next],null,data.text);
                break;
            case "setText": // 设置剧情文本的属性
                data.title=this.Colour(data.title);
                data.text=this.Colour(data.text);
                if (!/^\w+\.png$/.test(data.background))
                data.background=this.Colour(data.background);
                this.next = MotaActionBlocks['setText_s'].xmlText([
                data.position,data.offset,data.align,data.title,'rgba('+data.title+')',
                data.text,'rgba('+data.text+')',data.background,'rgba('+data.background+')',
                data.bold,data.titlefont,data.textfont,data.time,data.interval,this.next]);
                break;
            case "tip":
                this.next = MotaActionBlocks['tip_s'].xmlText([
                data.text,data.icon||"",this.next]);
                break;
            case "show": {// 显示
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach((t) => {
                    x_str.push(t[0]);
                    y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['show_s'].xmlText([
                x_str.join(','),y_str.join(','),data.floorId||'',data.time||0,data.async||false,this.next]);
                break;
            }
            case "hide": { // 消失
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach((t) => {
                    x_str.push(t[0]);
                    y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['hide_s'].xmlText([
                x_str.join(','),y_str.join(','),data.floorId||'',data.time||0,data.async||false,this.next]);
                break;
            }
            case "setBlock": { // 设置图块
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['setBlock_s'].xmlText([
                data.number||0,x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "showFloorImg": { // 显示贴图
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['showFloorImg_s'].xmlText([
                x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "hideFloorImg": {// 隐藏贴图
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['hideFloorImg_s'].xmlText([
                x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "showBgFgMap": {// 显示图层块
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['showBgFgMap_s'].xmlText([
                data.name||'bg', x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "hideBgFgMap": {// 隐藏图层块
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['hideBgFgMap_s'].xmlText([
                data.name||'bg', x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "setBgFgBlock": {// 设置图块
                data.loc=data.loc||[];
                if (!(data.loc[0] instanceof Array))
                data.loc = [data.loc];
                const x_str=[],y_str=[];
                data.loc.forEach(function (t) {
                x_str.push(t[0]);
                y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['setBgFgBlock_s'].xmlText([
                data.name||'bg', data.number||0, x_str.join(','),y_str.join(','),data.floorId||'',this.next]);
                break;
            }
            case "setHeroIcon": // 改变勇士
                this.next = MotaActionBlocks['setHeroIcon_s'].xmlText([
                data.name||"",this.next]);
                break;
            case "move": // 移动事件
                data.loc=data.loc||['',''];
                this.next = MotaActionBlocks['move_s'].xmlText([
                data.loc[0],data.loc[1],data.time||0,data.keep||false,data.async||false,this.StepString(data.steps),this.next]);
                break;
            case "moveHero": // 移动勇士
                this.next = MotaActionBlocks['moveHero_s'].xmlText([
                data.time||0,data.async||false,this.StepString(data.steps),this.next]);
                break;
            case "jump": // 跳跃事件
                data.from=data.from||['',''];
                data.to=data.to||['',''];
                this.next = MotaActionBlocks['jump_s'].xmlText([
                data.from[0],data.from[1],data.to[0],data.to[1],data.time||0,data.keep||false,data.async||false,this.next]);
                break;
            case "jumpHero": // 跳跃勇士
                data.loc=data.loc||['','']
                this.next = MotaActionBlocks['jumpHero_s'].xmlText([
                data.loc[0],data.loc[1],data.time||0,data.async||false,this.next]);
                break;
            case "changeFloor": // 楼层转换
                data.loc=data.loc||['','']
                this.next = MotaActionBlocks['changeFloor_s'].xmlText([
                data.floorId,data.loc[0],data.loc[1],data.direction,data.time||0,this.next]);
                break;
            case "changePos": // 直接更换勇士位置, 不切换楼层
                if(isset(data.loc)){
                this.next = MotaActionBlocks['changePos_0_s'].xmlText([
                    data.loc[0],data.loc[1],data.direction,this.next]);
                } else {
                this.next = MotaActionBlocks['changePos_1_s'].xmlText([
                    data.direction,this.next]);
                }
                break;
            case "follow": // 跟随勇士
                this.next = MotaActionBlocks['follow_s'].xmlText([data.name||"", this.next]);
                break;
            case "unfollow": // 取消跟随
                this.next = MotaActionBlocks['unfollow_s'].xmlText([data.name||"", this.next]);
                break;
            case "animate": {// 显示动画
                let animate_loc = data.loc||'';
                if(animate_loc && animate_loc!=='hero')animate_loc = animate_loc[0]+','+animate_loc[1];
                this.next = MotaActionBlocks['animate_s'].xmlText([
                data.name,animate_loc,data.async||false,this.next]);
                break;
            }
            case "setViewport": // 设置视角
                data.loc = data.loc||['',''];
                this.next = MotaActionBlocks['setViewport_s'].xmlText([
                data.loc[0],data.loc[1],this.next]);
                break;
            case "moveViewport": // 移动视角
                this.next = MotaActionBlocks['moveViewport_s'].xmlText([
                data.time||0,data.async||false,this.StepString(data.steps),this.next]);
                break;
            case "vibrate": // 画面震动
                this.next = MotaActionBlocks['vibrate_s'].xmlText([data.time||0, data.async||false, this.next]);
                break;
            case "showImage": // 显示图片
                data.loc=data.loc||['','']
                if (data.sloc) {
                this.next = MotaActionBlocks['showImage_1_s'].xmlText([
                    data.code,data.image||data.name,data.sloc[0],data.sloc[1],data.sloc[2],data.sloc[3],data.opacity,
                    data.loc[0],data.loc[1],data.loc[2],data.loc[3],data.time||0,data.async||false,this.next
                ]);
                }
                else {
                this.next = MotaActionBlocks['showImage_s'].xmlText([
                        data.code,data.image||data.name,data.loc[0],data.loc[1],data.opacity,data.time||0,data.async||false,this.next]);
                }
                break;
            case "hideImage": // 清除图片
                this.next = MotaActionBlocks['hideImage_s'].xmlText([
                data.code,data.time||0,data.async||false,this.next]);
                break;
            case "showTextImage": // 显示图片化文本
                data.loc=data.loc||['','']
                this.next = MotaActionBlocks['showTextImage_s'].xmlText([
                this.EvalString(data.text),data.code,data.loc[0],data.loc[1],data.lineHeight||1.4,data.opacity,data.time||0,data.async||false,this.next]);
                break;
            case "moveImage": // 移动图片
                data.to=data.to||['','']
                this.next = MotaActionBlocks['moveImage_s'].xmlText([
                data.code, data.to[0], data.to[1], data.opacity, data.time||0, data.async||false, this.next]);
                break;
            case "showGif": // 显示动图
                if(isset(data.name)){
                this.next = MotaActionBlocks['showGif_0_s'].xmlText([
                    data.name,data.loc[0],data.loc[1],this.next]);
                } else {
                    this.next = MotaActionBlocks['showGif_1_s'].xmlText([
                    this.next]);
                }
                break;
            case "setFg": // 颜色渐变
            case "setCurtain":
                if(isset(data.color)){
                data.color = this.Colour(data.color);
                this.next = MotaActionBlocks['setCurtain_0_s'].xmlText([
                    data.color,'rgba('+data.color+')',data.time||0,data.async||false,this.next]);
                } else {
                this.next = MotaActionBlocks['setCurtain_1_s'].xmlText([
                    data.time||0,data.async||false,this.next]);
                }
                break;
            case "screenFlash": // 画面闪烁
                data.color = this.Colour(data.color);
                this.next = MotaActionBlocks['screenFlash_s'].xmlText([
                    data.color,'rgba('+data.color+')',data.time||500,data.times||1,data.async||false,this.next]);
                break;
            case "setWeather": // 更改天气
                this.next = MotaActionBlocks['setWeather_s'].xmlText([
                data.name,data.level||1,this.next]);
                break;
            case "openDoor": // 开一个门, 包括暗墙
                data.loc=data.loc||['','']
                this.next = MotaActionBlocks['openDoor_s'].xmlText([
                data.loc[0],data.loc[1],data.floorId||'',data.needKey||false,data.async||false,this.next]);
                break;
            case "closeDoor": // 关一个门，需要该点无事件
                data.loc=data.loc||['','']
                this.next = MotaActionBlocks['closeDoor_s'].xmlText([
                data.loc[0],data.loc[1],data.id,data.async||false,this.next]);
                break;
            case "useItem": // 使用道具
                this.next = MotaActionBlocks['useItem_s'].xmlText([
                data.id,this.next]);
                break;
            case "loadEquip": // 装上装备
                this.next = MotaActionBlocks['loadEquip_s'].xmlText([
                data.id,this.next]);
                break;
            case "unloadEquip": // 卸下装备
                this.next = MotaActionBlocks['unloadEquip_s'].xmlText([
                data.pos,this.next]);
                break;
            case "openShop": // 打开一个全局商店
                this.next = MotaActionBlocks['openShop_s'].xmlText([
                data.id,this.next]);
                break;
            case "disableShop": // 禁用一个全局商店
                this.next = MotaActionBlocks['disableShop_s'].xmlText([
                data.id,this.next]);
                break;
            case "battle": // 强制战斗
                if (data.id) {
                this.next = MotaActionBlocks['battle_s'].xmlText([
                    data.id,this.next]);
                }
                else {
                data.loc = data.loc || [];
                this.next = MotaActionBlocks['battle_1_s'].xmlText([
                    data.loc[0],data.loc[1],this.next]);
                }
                break;
            case "trigger": // 触发另一个事件；当前事件会被立刻结束。需要另一个地点的事件是有效的
                this.next = MotaActionBlocks['trigger_s'].xmlText([
                data.loc[0],data.loc[1],data.keep,this.next]);
                break;
            case "insert": // 强制插入另一个点的事件在当前事件列表执行，当前坐标和楼层不会改变
                if (data.args instanceof Array) {
                try { data.args = JSON.stringify(data.args).replace(/"/g, "'"); }
                catch (e) {data.args = '';}
                }
                else data.args = null;
                if (isset(data.name)) {
                this.next = MotaActionBlocks['insert_1_s'].xmlText([
                    data.name, data.args||"", this.next]);
                }
                else {
                this.next = MotaActionBlocks['insert_2_s'].xmlText([
                    data.loc[0],data.loc[1],data.which,data.floorId||'',data.args||"",this.next]);
                }
                break;
            case "playSound":
                this.next = MotaActionBlocks['playSound_s'].xmlText([
                data.name,data.stop,this.next]);
                break;
            case "playBgm":
                this.next = MotaActionBlocks['playBgm_s'].xmlText([
                data.name,data.keep||false,this.next]);
                break
            case "pauseBgm":
                this.next = MotaActionBlocks['pauseBgm_s'].xmlText([
                this.next]);
                break
            case "resumeBgm":
                this.next = MotaActionBlocks['resumeBgm_s'].xmlText([
                this.next]);
                break
            case "loadBgm":
                this.next = MotaActionBlocks['loadBgm_s'].xmlText([
                data.name,this.next]);
                break
            case "freeBgm":
                this.next = MotaActionBlocks['freeBgm_s'].xmlText([
                data.name,this.next]);
                break
            case "stopSound":
                this.next = MotaActionBlocks['stopSound_s'].xmlText([
                this.next]);
                break
            case "setVolume":
                this.next = MotaActionBlocks['setVolume_s'].xmlText([
                data.value, data.time||0, data.async||false, this.next]);
                break
            case "setValue":
                this.next = MotaActionBlocks['setValue_s'].xmlText([
                this.tryToUseEvFlag_e('idString_e', [data.name]),
                MotaActionBlocks['evalString_e'].xmlText([data.value]),
                data.norefresh || false,
                this.next]);
                break;
            case "setValue2":
            case "addValue":
                this.next = MotaActionBlocks['addValue_s'].xmlText([
                this.tryToUseEvFlag_e('idString_e', [data.name]),
                MotaActionBlocks['evalString_e'].xmlText([data.value]),
                data.norefresh || false,
                this.next]);
                break;
            case "setEnemy":
                this.next = MotaActionBlocks['setEnemy_s'].xmlText([
                data.id, data.name, MotaActionBlocks['evalString_e'].xmlText([data.value]), this.next]);
                break;
            case "setFloor":
                this.next = MotaActionBlocks['setFloor_s'].xmlText([
                data.name, data.floorId||null, data.value, this.next]);
                break;
            case "setGlobalAttribute":
                this.next = MotaActionBlocks['setGlobalAttribute_s'].xmlText([
                data.name, data.value, this.next]);
                break;
            case "setGlobalValue":
                this.next = MotaActionBlocks['setGlobalValue_s'].xmlText([
                data.name, data.value, this.next]);
                break;
            case "setGlobalFlag":
                this.next = MotaActionBlocks['setGlobalFlag_s'].xmlText([
                data.name, data.value, this.next]);
                break;
            case "input":
                this.next = MotaActionBlocks['input_s'].xmlText([
                data.text,this.next]);
                break;
            case "input2":
                this.next = MotaActionBlocks['input2_s'].xmlText([
                data.text,this.next]);
                break;
            case "if": // 条件判断
                if (data["false"]) {
                this.next = MotaActionBlocks['if_s'].xmlText([
                    this.tryToUseEvFlag_e('evalString_e', [data.condition]),
                    this.insertActionList(data["true"]),
                    this.insertActionList(data["false"]),
                    this.next]);
                }
                else {
                this.next = MotaActionBlocks['if_1_s'].xmlText([
                    this.tryToUseEvFlag_e('evalString_e', [data.condition]),
                    this.insertActionList(data["true"]),
                    this.next]);
                }
                break;
            case "confirm": // 显示确认框
                this.next = MotaActionBlocks['confirm_s'].xmlText([
                this.EvalString(data.text), data["default"],
                this.insertActionList(data["yes"]),
                this.insertActionList(data["no"]),
                this.next]);
                break;
            case "switch": {// 多重条件分歧
                let case_caseList = null;
                for(let ii=data.caseList.length-1,caseNow;caseNow=data.caseList[ii];ii--) {
                case_caseList=MotaActionBlocks['switchCase'].xmlText([
                    isset(caseNow.case)?MotaActionBlocks['evalString_e'].xmlText([caseNow.case]):"值",caseNow.nobreak,this.insertActionList(caseNow.action),case_caseList]);
                }
                this.next = MotaActionBlocks['switch_s'].xmlText([
                // MotaActionBlocks['evalString_e'].xmlText([data.condition]),
                this.tryToUseEvFlag_e('evalString_e', [data.condition]),
                case_caseList,this.next]);
                break;
            }
            case "choices": {// 提供选项
                let text_choices = null;
                for(let ii=data.choices.length-1,choice;choice=data.choices[ii];ii--) {
                choice.color = this.Colour(choice.color);
                text_choices=MotaActionBlocks['choicesContext'].xmlText([
                    choice.text,choice.icon,choice.color,'rgba('+choice.color+')',choice.condition||'',this.insertActionList(choice.action),text_choices]);
                }
                if (!isset(data.text)) data.text = '';
                const info = this.getTitleAndPosition(data.text);
                this.next = MotaActionBlocks['choices_s'].xmlText([
                info[3],info[0],info[1],text_choices,this.next]);
                break;
            }
            case "while": // 前置条件循环处理
                this.next = MotaActionBlocks['while_s'].xmlText([
                // MotaActionBlocks['evalString_e'].xmlText([data.condition]),
                this.tryToUseEvFlag_e('evalString_e', [data.condition]),
                this.insertActionList(data["data"]),
                this.next]);
                break;
            case "dowhile": // 后置条件循环处理
                this.next = MotaActionBlocks['dowhile_s'].xmlText([
                this.insertActionList(data["data"]),
                // MotaActionBlocks['evalString_e'].xmlText([data.condition]),
                this.tryToUseEvFlag_e('evalString_e', [data.condition]),
                this.next]);
                break;
            case "break": // 跳出循环
                this.next = MotaActionBlocks['break_s'].xmlText([
                this.next]);
                break;
            case "continue": // 继续执行当前循环
                this.next = MotaActionBlocks['continue_s'].xmlText([
                this.next]);
                break;
            case "win":
                this.next = MotaActionBlocks['win_s'].xmlText([
                data.reason,data.norank?true:false,data.noexit?true:false,this.next]);
                break;
            case "lose":
                this.next = MotaActionBlocks['lose_s'].xmlText([
                data.reason,this.next]);
                break;
            case "restart":
                this.next = MotaActionBlocks['restart_s'].xmlText([
                this.next]);
                break;
            case "function": {
                let func = data["function"];
                func=func.split('{').slice(1).join('{').split('}').slice(0,-1).join('}').trim().split('\n').join('\\n');
                this.next = MotaActionBlocks['function_s'].xmlText([
                data.async||false,func,this.next]);
                break;
            }
            case "update":
                this.next = MotaActionBlocks['update_s'].xmlText([
                this.next]);
                break;
            case "showStatusBar":
                this.next = MotaActionBlocks['showStatusBar_s'].xmlText([
                this.next]);
                break;
            case "hideStatusBar":
                this.next = MotaActionBlocks['hideStatusBar_s'].xmlText([
                data.toolbox||false,this.next]);
                break;
            case "showHero":
                this.next = MotaActionBlocks['showHero_s'].xmlText([
                this.next]);
                break;
            case "hideHero":
                this.next = MotaActionBlocks['hideHero_s'].xmlText([
                this.next]);
                break;
            case "sleep": // 等待多少毫秒
                this.next = MotaActionBlocks['sleep_s'].xmlText([
                data.time||0,data.noSkip||false,this.next]);
                break;
            case "wait": { // 等待用户操作
                let case_waitList = null;
                if (data.data) {
                for(let ii=data.data.length-1,caseNow;caseNow=data.data[ii];ii--) {
                    if (caseNow["case"] == "keyboard") {
                    case_waitList = MotaActionBlocks['waitContext_1'].xmlText([
                        caseNow.keycode || 0, this.insertActionList(caseNow.action), case_waitList
                    ]);
                    } else if (caseNow["case"] == "mouse") {
                    case_waitList = MotaActionBlocks['waitContext_2'].xmlText([
                        caseNow.px[0], caseNow.px[1], caseNow.py[0], caseNow.py[1], this.insertActionList(caseNow.action), case_waitList
                    ]);
                    }
                }
                }
                this.next = MotaActionBlocks['wait_s'].xmlText([
                case_waitList, this.next]);
                break;
            }
            case "waitAsync": // 等待所有异步事件执行完毕
                this.next = MotaActionBlocks['waitAsync_s'].xmlText([
                this.next]);
                break;
            case "revisit": // 立刻重新执行该事件
                this.next = MotaActionBlocks['revisit_s'].xmlText([
                this.next]);
                break;
            case "callBook": // 呼出怪物手册
                this.next = MotaActionBlocks['callBook_s'].xmlText([
                this.next]);
                break;
            case "callSave": // 呼出存档界面
                this.next = MotaActionBlocks['callSave_s'].xmlText([
                this.next]);
                break;
            case "autoSave": // 自动存档
                this.next = MotaActionBlocks['autoSave_s'].xmlText([
                data.nohint||false, this.next]);
                break;
            case "callLoad": // 呼出读档界面
                this.next = MotaActionBlocks['callLoad_s'].xmlText([
                this.next]);
                break;
            case "exit": // 立刻结束事件
                this.next = MotaActionBlocks['exit_s'].xmlText([
                this.next]);
                break;
            case "previewUI": // UI绘制预览
                this.next = MotaActionBlocks['previewUI_s'].xmlText([
                this.insertActionList(data.action), this.next
                ]);
                break;
            case "clearMap": // 清除画布
                if (data.x != null && data.y != null && data.width != null && data.height != null) {
                this.next = MotaActionBlocks['clearMap_s'].xmlText([
                    data.x, data.y, data.width, data.height, this.next
                ]);
                }
                else {
                this.next = MotaActionBlocks['clearMap_1_s'].xmlText([this.next]);
                }
                break;
            case "setAttribute": // 设置画布属性
                data.fillStyle=this.Colour(data.fillStyle);
                data.strokeStyle=this.Colour(data.strokeStyle);
                this.next = MotaActionBlocks['setAttribute_s'].xmlText([
                data.font,data.fillStyle,'rgba('+data.fillStyle+')',data.strokeStyle,'rgba('+data.strokeStyle+')',
                data.lineWidth,data.alpha,data.align,data.baseline,data.z,this.next]);
                break;
            case "fillText": // 绘制一行文本
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['fillText_s'].xmlText([
                data.x, data.y, data.style, 'rgba('+data.style+')', data.font, data.maxWidth, this.EvalString(data.text), this.next
                ]);
                break;
            case "fillBoldText": // 绘制一行描边文本
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['fillBoldText_s'].xmlText([
                data.x, data.y, data.style, 'rgba('+data.style+')', data.font, this.EvalString(data.text), this.next
                ]);
                break;
            case "drawTextContent": // 绘制多行文本
                data.color = this.Colour(data.color);
                this.next = MotaActionBlocks['drawTextContent_s'].xmlText([
                this.EvalString(data.text), data.left, data.top, data.maxWidth, data.color, 'rgba('+data.color+')',
                data.align, data.fontSize, data.lineHeight, data.bold, this.next
                ]);
                break;
            case "fillRect": // 绘制矩形
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['fillRect_s'].xmlText([
                data.x, data.y, data.width, data.height, data.style, 'rgba('+data.style+')', this.next
                ]);
                break;
            case "strokeRect": // 绘制矩形边框
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['strokeRect_s'].xmlText([
                data.x, data.y, data.width, data.height, data.style, 'rgba('+data.style+')', data.lineWidth, this.next
                ]);
                break;
            case "drawLine": // 绘制线段
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['drawLine_s'].xmlText([
                data.x1, data.y1, data.x2, data.y2, data.style, 'rgba('+data.style+')', data.lineWidth, this.next
                ]);
                break;
            case "drawArrow": // 绘制线段
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['drawArrow_s'].xmlText([
                data.x1, data.y1, data.x2, data.y2, data.style, 'rgba('+data.style+')', data.lineWidth, this.next
                ]);
                break;
            case "fillPolygon": {// 绘制多边形
                data.style = this.Colour(data.style);
                const x_str=[], y_str=[];
                data.nodes.forEach(function (t) {
                    x_str.push(t[0]);
                    y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['fillPolygon_s'].xmlText([
                x_str.join(','), y_str.join(','), data.style, 'rgba('+data.style+')', this.next
                ]);
                break;
            }
            case "strokePolygon": {// 绘制多边形
                data.style = this.Colour(data.style);
                const x_str = [], y_str = [];
                data.nodes.forEach((t) => {
                    x_str.push(t[0]);
                    y_str.push(t[1]);
                })
                this.next = MotaActionBlocks['strokePolygon_s'].xmlText([
                x_str.join(','), y_str.join(','), data.style, 'rgba('+data.style+')', data.lineWidth, this.next
                ]);
                break;
            }
            case "fillCircle": // 绘制圆
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['fillCircle_s'].xmlText([
                data.x, data.y, data.r, data.style, 'rgba('+data.style+')', this.next
                ]);
                break;
            case "strokeCircle": // 绘制圆边框
                data.style = this.Colour(data.style);
                this.next = MotaActionBlocks['strokeCircle_s'].xmlText([
                data.x, data.y, data.r, data.style, 'rgba('+data.style+')', data.lineWidth, this.next
                ]);
                break;
            case "drawImage": // 绘制图片
                if (data.x1 != null && data.y1 != null && data.w1 != null && data.h1 != null) {
                    this.next = MotaActionBlocks['drawImage_1_s'].xmlText([
                        data.image, data.x, data.y, data.w, data.h, data.x1, data.y1, data.w1, data.h1, this.next
                    ]);
                } else {
                    this.next = MotaActionBlocks['drawImage_s'].xmlText([
                        data.image, data.x, data.y, data.w, data.h, this.next
                    ]);
                }
                break;
            case "drawIcon": // 绘制图标
                this.next = MotaActionBlocks['drawIcon_s'].xmlText([
                    data.id, data.x, data.y, data.width, data.height, this.next
                ]);
                break;
            case "drawBackground": // 绘制背景
                if (!(/^\w+\.png$/.test(data.background)))
                    data.background=this.Colour(data.background);
                this.next = MotaActionBlocks['drawBackground_s'].xmlText([
                data.background, 'rgba('+data.background+')', data.x, data.y, data.width, data.height, this.next
                ]);
                break;
            case "drawSelector": {// 绘制光标
                if (data.image) {
                    this.next = MotaActionBlocks['drawSelector_s'].xmlText([
                        data.image, data.code, data.x, data.y, data.width, data.height, this.next
                    ]);
                } else {
                    this.next = MotaActionBlocks['drawSelector_1_s'].xmlText([data.code, this.next]);
                }
                break;
            }
            case "animateImage": { // 兼容 animateImage
                break;
            }
            default:
                this.next = MotaActionBlocks['unknown_s'].xmlText([
                JSON.stringify(data),this.next]);
        }
        this.parseAction();
        return;
    }

      /** 往当前事件列表之后添加一个事件组 */
    insertActionList(actionList) {
        if (actionList.length===0) return null;
        this.event.data.list.push({"type": "_next", "next": this.next});
        this.event.data.list=this.event.data.list.concat(actionList);
        this.next = null;
        this.parseAction();
        return this.result;
    }

    StepString(steplist) {
        const stepchar = {
            'up': '上',
            'down': '下',
            'left': '左',
            'right': '右',
            'forward': '前',
            'backward': '后'
        }
        const StepString = [];
        for(let obj of steplist) {
            if (typeof(obj)===typeof('')) {
                StepString.push(stepchar[obj]);
            } else {
                StepString.push(stepchar[obj['direction']]);
                StepString.push(obj['value']);
            }
        }
        return StepString.join('');
    }
    
    EvalString(EvalString) {
        return EvalString.split('\b').join('\\b').split('\t').join('\\t').split('\n').join('\\n');
    }
    
    getTitleAndPosition (string) {
      string = this.EvalString(string);
      let title = '', icon = '', position = '';
      string = string.replace(/\\t\[(([^\],]+),)?([^\],]+)\]/g, function (s0, s1, s2, s3) {
            if (s3) title = s3;
            if (s2) { icon = s3; title = s2; }
            if (icon && !/^[0-9a-zA-Z_][0-9a-zA-Z_:]*$/.test(icon)) { title += "," + icon; icon = ''; }
            return "";
      }).replace(/\\b\[(.*?)\]/g, (s0, s1) => {
            position = s1; return "";
      });
      return [title, icon, position, string];
    }
    
    Colour(color) {
        return color ? JSON.stringify(color).slice(1,-1) : null;
    }
    
    tryToUseEvFlag_e(defaultType, args, isShadow, comment) {
        const match = /^switch:([A-Z])$/.exec(args[0])
        if(match) {
            args[0] = match[1]
            return MotaActionBlocks['evFlag_e'].xmlText(args, isShadow, comment);
        }
        return MotaActionBlocks[defaultType||'evalString_e'].xmlText(args, isShadow, comment);
    }
}
    
const stepDict = {
    "U": "up",
    "D": "down",
    "L": "left",
    "R": "right",
    "F": "forward",
    "B": "backward",
}

export const MotaActionFunctions = {

    Int_pre(intstr) {
        return parseInt(intstr);
    },
    
    Number_pre(intstr) {
        return parseFloat(intstr);
    },
    
    /** 返回各LexerRule文本域的预处理函数,方便用来统一转义等等 */
    pre(LexerId) {
        if (this.hasOwnProperty(LexerId+'_pre')) {
            return this[LexerId+'_pre'].bind(this);
        }
        return (obj => obj);
    },

    /**
     * 构造这个方法是为了能够不借助workspace,从语法树直接构造图块结构
     * inputs的第i个元素是第i个args的xmlText,null或undefined表示空
     * inputs的第rule.args.length个元素是其下一个语句的xmlText
     * @param {String} ruleName 
     * @param {Array} inputs 
     * @param {Boolean} isShadow 
     * @param {String} comment 
     */
    xmlText(ruleName, inputs, isShadow, comment) {
        if(!inputs) inputs = [];
        const rule = MotaActionBlocks[ruleName];
        const blocktext = isShadow ? 'shadow':'block';
        const next = inputs[rule.args.length];

        const xmlText = [
            `<${blocktext} type="${ruleName}">`,
            rule.argsType.map((type, ii) => {
                let input = inputs[ii];
                let _input = '';
                const noinput = (input===null || input===undefined);
                if(noinput && type === 'field') return '';
                if(noinput) input = '';
                if(type !== 'field') {
                    let subrulename = rule.args[ii];
                    subrulename=subrulename.split('_').slice(0,-1).join('_');
                    let subrule = MotaActionBlocks[subrulename];
                    if (subrule instanceof Array) { // 有子列表时
                        subrulename = subrule[subrule.length-1];
                        subrule = MotaActionBlocks[subrulename];
                    } else {
                        if (noinput && !isShadow) {
                            // 无输入的默认行为是: 如果语句块的备选方块只有一个,直接代入方块
                            input = subrule.xmlText();
                        }
                    }
                    _input = subrule.xmlText([],true);
                }
                return `<${type} name="${rule.args[ii]}">${_input+input}</${type}>`;
            }),
            comment ? `<comment><![CDATA[${comment.replace(/]]>/g,'] ] >')}]]></comment>` : '',
            next ? `<next>${next}</next>` : '',
            `</${blocktext}>`
        ];
        return xmlText.join('');
    },
    
    actionParser: new ActionParser(),
    
    parse(obj, type = "event") {
        obj = Function("return " + obj.replace(/[<>&]/g, function (c) {
            return {'<': '&lt;', '>': '&gt;', '&': '&amp;'}[c];
        }).replace(/\\(r|f|i|c|d|e)/g,'\\\\$1'))();
        try {
            obj = JSON.parse(this.replaceToName(JSON.stringify(obj)));
        } catch (e) {}
        const xml_text = this.actionParser.parse(obj, type);
        return Blockly.Xml.textToDom('<xml>'+xml_text+'</xml>');
    },
    
    EvalString_pre(EvalString){
        if (EvalString.indexOf('__door__')!==-1) throw new Error('请修改开门变量__door__，如door1，door2，door3等依次向后。请勿存在两个门使用相同的开门变量。');
        EvalString = MotaActionFunctions.replaceFromName(EvalString);
        return EvalString.replace(/([^\\])"/g,'$1\\"').replace(/^"/g,'\\"').replace(/""/g,'"\\"');
    },
    
    IdString_pre(IdString){
        if (IdString.indexOf('__door__')!==-1) throw new Error('请修改开门变量__door__，如door1，door2，door3等依次向后。请勿存在两个门使用相同的开门变量。');
        IdString = MotaActionFunctions.replaceFromName(IdString);
        if (IdString && !(this.pattern.id.test(IdString)) && !(this.pattern.idWithoutFlag.test(IdString)))
            throw new Error('id: '+IdString+'中包含了0-9 a-z A-Z _ - :之外的字符');
        return IdString;
    },
    
    PosString_pre(PosString){
        if (!PosString || /^-?\d+$/.test(PosString)) return PosString;
        //if (!(this.pattern.id.test(PosString)))throw new Error(PosString+'中包含了0-9 a-z A-Z _ 和中文之外的字符,或者是没有以flag: 开头');
        return `"${this.replaceFromName(PosString)}"`;
    },
    
    StepString_pre(StepString){
        //StepString='上右3下2左上左2'
        const route = StepString.replace(/上/g,'U').replace(/下/g,'D').replace(/左/g,'L').replace(/右/g,'R').replace(/前/g,'F').replace(/后/g,'B');
    
        //copyed from core.js
        let ans=[], index=0;
    
        const getNumber = function (noparse) {
            let num="";
            while (index<route.length && !isNaN(route.charAt(index))) {
            num+=route.charAt(index++);
            }
            if (num.length==0) num="1";
            return isset(noparse) ? num : parseInt(num);
        }
    
        while (index<route.length) {
            const c=route.charAt(index++);
            const number=getNumber();
    
            ans.push(...new Array(number).fill(stepDict[c]));
        }
        return ans;
    },
    
    pattern: {
        id: /^(flag|global):([a-zA-Z0-9_\u4E00-\u9FCC]+)$/,
        id2: /^flag:([a-zA-Z0-9_\u4E00-\u9FCC]+),flag:([a-zA-Z0-9_\u4E00-\u9FCC]+)$/,
        idWithoutFlag: /^[0-9a-zA-Z_][0-9a-zA-Z_\-:]*$/,
        colorRe: /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d),(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(,0(\.\d+)?|,1)?$/,
        fontRe: /^(italic )?(bold )?(\d+)px ([a-zA-Z0-9_\u4E00-\u9FCC]+)$/,
        replaceStatusList: [
            // 保证顺序！
            ["hpmax", "生命上限"],
            ["hp", "生命"],
            ["name", "名称"],
            ["lv", "等级"],
            ["atk", "攻击"],
            ["def", "防御"],
            ["mdef", "魔防"],
            ["manamax", "魔力上限"],
            ["mana", "魔力"],
            ["money", "金币"],
            ["experience", "经验"],
            ["steps", "步数"],
        ],
        replaceItemList: [
            // 保证顺序！
            ["yellowKey", "黄钥匙"],
            ["blueKey", "蓝钥匙"],
            ["redKey", "红钥匙"],
            ["redJewel", "红宝石"],
            ["blueJewel", "蓝宝石"],
            ["greenJewel", "绿宝石"],
            ["yellowJewel", "黄宝石"],
            ["redPotion", "红血瓶"],
            ["bluePotion", "蓝血瓶"],
            ["yellowPotion", "黄血瓶"],
            ["greenPotion", "绿血瓶"],
            ["sword1", "铁剑"],
            ["sword2", "银剑"],
            ["sword3", "骑士剑"],
            ["sword4", "圣剑"],
            ["sword5", "神圣剑"],
            ["shield1", "铁盾"],
            ["shield2", "银盾"],
            ["shield3", "骑士盾"],
            ["shield4", "圣盾"],
            ["shield5", "神圣盾"],
            ["superPotion", "圣水"],
            ["moneyPocket", "金钱袋"],
            ["book", "怪物手册"],
            ["fly", "楼层传送器"],
            ["coin", "幸运金币"],
            ["snow", "冰冻徽章"],
            ["cross", "十字架"],
            ["knife", "屠龙匕首"],
            ["shoes", "绿鞋"],
            ["bigKey", "大黄门钥匙"],
            ["greenKey", "绿钥匙"],
            ["steelKey", "铁门钥匙"],
            ["pickaxe", "破墙镐"],
            ["icePickaxe", "破冰镐"],
            ["bomb", "炸弹"],
            ["centerFly", "中心对称飞行器"],
            ["upFly", "上楼器"],
            ["downFly", "下楼器"],
            ["earthquake", "地震卷轴"],
            ["poisonWine", "解毒药水"],
            ["weakWine", "解衰药水"],
            ["curseWine", "解咒药水"],
            ["superWine", "万能药水"],
            ["hammer", "圣锤"],
            ["lifeWand", "生命魔杖"],
            ["jumpShoes", "跳跃靴"],
        ],
        replaceEnemyList: [
            // 保证顺序！
            ["name", "名称"],
            ["atk", "攻击"],
            ["def", "防御"],
            ["money", "金币"],
            ["experience", "经验"],
            ["point", "加点"],
            ["special", "属性"],
        ]
    },

    disableReplace: false,

    compileBuffer: {},
    /**
     * 生成替换规则
     * @param {String} tag 标签
     * @param {Array<Array<String, String, [Array]>>} rules 
     * @param {"to"|"from"} mode 
     */
    compileRules(tag, rules, mode) {
        if (!this.compileBuffer[tag]) {
            const regfuncs = [];
            const [from, to] = (mode == "to") ? [0, 1] : [1, 0];
            const createMap = (rule) => {
                const map = {}, list = [];
                rule.forEach((v) => {
                    map[v[from]] = v[to], list.push(v[from]);
                });
                return { map, list };
            }
            for (let rule of rules) {
                let r;
                if (rule[0] instanceof Function) {
                    r = rule[0](rule[1] ? createMap(rule[1]) : null);
                } else {
                    if (rule[2]) {
                        const { map, list } = createMap(rule[2]);
                        const toword = rule[to];
                        rule[from] = `${rule[from]}(${list.join("|")})?`;
                        rule[to] = (a, b) => toword + (b ? map[b] : '');
                    }
                    const reg = new RegExp(rule[from], "g");
                    r = (s => s.replace(reg, rule[to])); 
                }
                regfuncs.push(r);
            }
            this.compileBuffer[tag] = (s) => {
                for (let func of regfuncs) s = func(s);
                return s;
            }
        }
        return this.compileBuffer[tag];
    },
    
    replaceToName (str) {
        if (!str || this.disableReplace) return str;

        const replacer = this.compileRules("toname", [
            ["status:", "状态：", this.pattern.replaceStatusList],
            ["item:", "物品：", this.pattern.replaceStatusList],
            ["flag:", "变量："],
            ["switch:", "独立开关："],
            ["global:", "全局存储："],
            [({map, list}) => {
                const reg = new RegExp("enemy:([a-zA-Z0-9_]+).(" + list.join('') + ")", "g")
                return s => s.replace(reg, (a, b, c) => {
                    return map[c] ? ("怪物：" + b + "：" + map[c]) : c;
                });
            }, this.pattern.replaceEnemyList],
            ["enemy:", "怪物："],
            ["blockId:", "图块ID："],
            ["blockCls", "图块类别："],
            ["equip", "装备孔："],
        ], "to");

        return replacer(str);
    },
    
    replaceFromName (str) {
        if (!str || this.disableReplace) return str;

        const replacer = this.compileRules("fromname", [
            ["status:", "状态[:：]", this.pattern.replaceStatusList],
            ["item:", "物品[:：]", this.pattern.replaceStatusList],
            ["flag:", "变量[:：]"],
            ["switch:", "独立开关[:：]"],
            ["global:", "全局存储[:：]"],
            [({map, list}) => {
                const reg = new RegExp("(enemy:|怪物[:：])([a-zA-Z0-9_]+)[:：](" + list.join('') + ")", "g")
                return s => s.replace(reg, (a, b, c, d) => {
                    return map[d] ? ("enemy:" + c + ":" + map[d]) : d;
                });
            }, this.pattern.replaceEnemyList],
            ["enemy:", "怪物[:：]"],
            ["blockId:", "图块ID[:：]"],
            ["blockCls", "图块类别[:：]"],
            ["equip", "装备孔[:：]"],
        ], "from");

        return replacer(str);
    }
};