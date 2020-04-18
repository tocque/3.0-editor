/**
 * @file runtime.d.ts 运行时的类型标注
 * @author 秋橙 & tocque
 */

/** @file control.js 主要用来进行游戏控制，比如行走控制、自动寻路、存读档等等游戏核心内容。 */
declare class control {

    /**
     * 设置某个自定义变量或flag
     * @example core.setFlag('xyz', 2) // 设置变量xyz为2
     * @param name 变量名
     * @param value 要设置的值
     */
    setFlag(name: string, value: any): void

    /**
     * 获取某个自定义变量或flag
     * @example core.getFlag('point', 2) // 获得变量point的值；如果该变量从未定义过则返回2
     * @param name 变量名
     * @param defaultValue 该变量不存在时返回的值。
     * @returns 变量的值
     */
    getFlag(name: string, defaultValue: any): any

    /**
     * 返回是否存在某个变量且不为0。等价于 core.getFlag('xyz', 0)!=0
     */
    hasFlag(name: string): boolean

    /** 删除某个flag/变量 */
    removeFlag(name: string): void

    /** 设置大地图的偏移量 */
    setGameCanvasTranslate(canvasId, x: number, y: number): void

    /** 更新大地图的可见区域 */
    updateViewport(): void

    /** 立刻聚集所有的跟随者 */
    gatherFollowers(): void


    /** 回放下一个操作 */
    replay(): void
}

interface enemy {
    id: string
    [key: string]: any
}

/** @file enemys.js 定义了一系列和敌人相关的API函数。 */
declare class enemys {

    /**
     * 判定某种特殊属性的有无
     * @example core.hasSpecial('greenSlime', 1) // 判定绿头怪有无先攻属性
     * @param special 敌人id或敌人对象或正整数数组或自然数
     * @param test 待检查的属性编号
     * @returns 若special为数组或数且含有test或相等、或special为敌人id或对象且具有此属性，则返回true
     */
    hasSpecial(special: number | number[] | string | enemy, test: number): boolean

    /**
     * 获得某种敌人的全部特殊属性名称
     * @example core.getSpecialText('greenSlime') // ['先攻', '3连击', '破甲', '反击']
     * @param enemy 敌人id或敌人对象，如core.material.enemys.greenSlime
     * @returns 字符串数组
     */
    getSpecialText(enemy: string | enemy): string[]

    /**
     * 获得某种敌人的某种特殊属性的介绍
     * @example core.getSpecialHint('bat', 1) // '先攻：怪物首先攻击'
     * @param enemy 敌人id或敌人对象，用于确定属性的具体数值，否则可选
     * @param special 属性编号，可以是该敌人没有的属性
     * @returns 属性的介绍，以属性名加中文冒号开头
     */
    getSpecialHint(enemy: string | enemy, special: number): string

    /**
     * 判定主角当前能否打败某只敌人
     * @example core.canBattle('greenSlime',0,0,'MT0') // 能否打败主塔0层左上角的绿头怪（假设有）
     * @param enemy 敌人id或敌人对象
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns true表示可以打败，false表示无法打败
     */
    canBattle(enemy: string | enemy, x?: number, y?: number, floorId?: string): boolean

    /**
     * 获得某只敌人对主角的总伤害
     * @example core.getDamage('greenSlime',0,0,'MT0') // 绿头怪的总伤害
     * @param enemy 敌人id或敌人对象
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns 总伤害，如果因为没有破防或无敌怪等其他原因无法战斗，则返回null
     */
    getDamage(enemy: string | enemy, x?: number, y?: number, floorId?: string): number

    /**
     * 获得某只敌人的固伤加仇恨伤害
     * @example core.getExtraDamage('greenSlime',0,0,'MT0') // 绿头怪的固伤加仇恨伤害
     * @param enemy 敌人id或敌人对象
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns 伤害值，【关闭负伤】时不可被魔防抵挡
     */
    getExtraDamage(enemy: string | enemy, x?: number, y?: number, floorId?: string): number

    /**
     * 获得某只敌人的地图显伤，包括颜色
     * @example core.getDamageString('greenSlime', 0, 0, 'MT0') // 绿头怪的地图显伤
     * @param enemy 敌人id或敌人对象
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns damage: 表示伤害值或为'???'，color: 形如'#RrGgBb'
     */
    getDamageString(enemy: string | enemy, x?: number, y?: number, floorId?: string): {
        damage: string,
        color: string
    }

    /**
     * 获得某只敌人接下来的若干个临界及其减伤，算法基于useLoop开关选择回合法或二分法
     * @example core.nextCriticals('greenSlime', 9, 0, 0, 'MT0') // 绿头怪接下来的9个临界
     * @param enemy 敌人id或敌人对象
     * @param number 要计算的临界数量，可选，默认为1
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns 两列的二维数组，每行表示一个临界及其减伤
     */
    nextCriticals(enemy: string | enemy, number?: number, x?: number, y?: number, floorId?: string): number[][]

    /**
     * 计算再加若干点防御能使某只敌人对主角的总伤害降低多少
     * @example core.nextCriticals('greenSlime', 10, 0, 0, 'MT0') // 再加10点防御能使绿头怪的伤害降低多少
     * @param enemy 敌人id或敌人对象
     * @param k 假设主角增加的防御力，可选，默认为1
     * @param x 敌人的横坐标，可选
     * @param y 敌人的纵坐标，可选
     * @param floorId 敌人所在的地图，可选
     * @returns 总伤害的减少量
     */
    getDefDamage(enemy: string | enemy, k?: number, x?: number, y?: number, floorId?: string): number

    /**
     * 获得某张地图的敌人集合，用于手册绘制
     * @example core.getCurrentEnemys('MT0') // 主塔0层的敌人集合
     * @param floorId 地图id，可选
     * @returns 敌人集合，按伤害升序排列，支持多朝向怪合并
     */
    getCurrentEnemys(floorId?: string): object[]

    /**
     * 检查某些楼层是否还有漏打的（某种）敌人
     * @example core.hasEnemyLeft('greenSlime', ['sample0', 'sample1']) // 样板0层和1层是否有漏打的绿头怪
     * @param enemyId 敌人id，可选，默认为任意敌人
     * @param floorId 地图id或其数组，可选，默认为当前地图
     * @returns true表示有敌人被漏打，false表示敌人已死光
     */
    hasEnemyLeft(enemyId?: string, floorId?: string | string[]): boolean
}

/**@file items.js 主要负责一切和道具相关的内容。 */
declare class items {

    /**
     * 即捡即用类的道具获得时的效果
     * @example core.getItemEffect('redPotion', 10) // 执行获得10瓶红血的效果
     * @param itemId 道具id
     * @param itemNum 道具数量，可选，默认为1
     */
    getItemEffect(itemId: string, itemNum?: number): void

    /**
     * 即捡即用类的道具获得时的额外提示
     * @example core.getItemEffectTip(redPotion) // （获得 红血瓶）'，生命+100'
     * @param itemId 道具id
     * @returns 图块属性itemEffectTip的内容
     */
    getItemEffectTip(itemId: string): string

    /**
     * 使用一个道具
     * @example core.useItem('pickaxe', true) // 使用破墙镐，不计入录像，无回调
     * @param itemId 道具id
     * @param noRoute 是否不计入录像，快捷键使用的请填true，否则可省略
     * @param callback 道具使用完毕或使用失败后的回调函数
     */
    useItem(itemId: string, noRoute?: boolean, callback?: () => void): void

    /**
     * 检查能否使用某种道具
     * @example core.canUseItem('pickaxe') // 能否使用破墙镐
     * @param itemId 道具id
     * @returns true表示可以使用，false表示无法使用
     */
    canUseItem(itemId: string): boolean

    /**
     * 统计某种道具的持有量
     * @example core.itemCount('yellowKey') // 持有多少把黄钥匙
     * @param itemId 道具id
     * @returns 该种道具的持有量，不包括已穿戴的装备
     */
    itemCount(itemId: string): number

    /**
     * 检查主角是否持有某种道具
     * @example core.hasItem('yellowKey') // 主角是否持有黄钥匙
     * @param itemId 道具id
     * @returns true表示持有，false表示未持有，不包括已穿戴的装备
     */
    hasItem(itemId: string): boolean

    /**
     * 检查主角是否穿戴着某件装备
     * @example core.hasEquip('sword5') // 主角是否装备了神圣剑
     * @param itemId 装备id
     * @returns true表示已装备，false表示未装备
     */
    hasEquip(itemId: string): boolean

    /**
     * 检查主角某种类型的装备目前是什么
     * @example core.getEquip(1) // 主角目前装备了什么盾牌
     * @param equipType 装备类型，自然数
     * @returns 装备id，或null表示未穿戴
     */
    getEquip(equipType: number): string

    /**
     * 设置某种道具的持有量
     * @example core.setItem('shoes') // 没收绿鞋，重新启用passNet触发器
     * @param itemId 道具id
     * @param itemNum 新的持有量，可选，自然数，默认为0
     */
    setItem(itemId: string, itemNum?: number): void

    /**
     * 静默增减某种道具的持有量 不会更新游戏画面或是显示提示
     * @example core.addItem('yellowKey', -2) // 没收两把黄钥匙
     * @param itemId 道具id
     * @param itemNum 增加量，负数表示没收
    */
   addItem(itemId: string, itemNum?: number): void

    /**
     * 判定某件装备的类型
     * @example core.getEquipTypeById('shield5') // 1（盾牌）
     * @param equipId 装备id
     * @returns 类型编号，自然数
     */
    getEquipTypeById(equipId: string): number

    /**
     * 检查能否穿上某件装备
     * @example core.canEquip('sword5', true) // 主角可以装备神圣剑吗，如果不能会有提示
     * @param equipId 装备id
     * @param hint 无法穿上时是否提示（比如是因为未持有还是别的什么原因）
     * @returns true表示可以穿上，false表示无法穿上
     */
    canEquip(equipId: string, hint: boolean): boolean

    /**
     * 尝试穿上某件装备并提示
     * @example core.loadEquip('sword5') // 尝试装备上神圣剑，无回调
     * @param equipId 装备id
     * @param callback 穿戴成功或失败后的回调函数
     */
    loadEquip(equipId: string, callback?: () => void): void

    /**
     * 脱下某个类型的装备
     * @example core.unloadEquip(1) // 卸下盾牌，无回调
     * @param equipType 装备类型编号，自然数
     * @param callback 卸下装备后的回调函数
     */
    unloadEquip(equipType: number, callback?: () => void): void

    /**
     * 比较两件（类型可不同）装备的优劣
     * @example core.compareEquipment('sword5', 'shield5') // 比较神圣剑和神圣盾的优劣
     * @param compareEquipId 装备甲的id
     * @param beComparedEquipId 装备乙的id
     * @returns 两装备的各属性差，甲减乙，0省略
     */
    compareEquipment(compareEquipId: string, beComparedEquipId: string): object

    /**
     * 保存当前套装
     * @example core.quickSaveEquip(1) // 将当前套装保存为1号套装
     * @param index 套装编号，自然数
     */
    quickSaveEquip(index: number): void

    /**
     * 快速换装
     * @example core.quickLoadEquip(1) // 快速换上1号套装
     * @param index 套装编号，自然数
     */
    quickLoadEquip(index: number): void

    /**
     * 计算某种属性被当前套装增加的常数值
     * @example core.getEquippedStatus('atk') // 当前套装共加多少点攻击
     * @param name 属性的英文缩写
     */
    getEquippedStatus(name: string): number
}

type CtxRefer = string | CanvasRenderingContext2D | HTMLCanvasElement
/**
 * @file ui.js 主要用来进行UI窗口的绘制，比如对话框、怪物手册、楼传器、存读档界面等等。
 */
declare class ui {

    /**
     * 根据画布名找到一个画布的context；支持系统画布和自定义画布。如果不存在画布返回null。
     * 也可以传画布的context自身，则返回自己。
     */
    getContextByName(canvas: CtxRefer): CanvasRenderingContext2D

    /**
     * 清空某个画布图层
     * name为画布名，可以是系统画布之一，也可以是任意自定义动态创建的画布名；还可以直接传画布的context本身。（下同）
     * 如果name也可以是'all'，若为all则为清空所有系统画布。
     */
    clearMap(name: CtxRefer): void

    /**
     * 在某个画布上绘制一段文字
     * @param text 要绘制的文本
     * @param style 绘制的样式
     * @param font 绘制的字体
     */
    fillText(name: CtxRefer, text: string, x: number, y: number, style: string, font: string): void

    /**
     * 在某个画布上绘制一个描黑边的文字
     * @param text 要绘制的文本
     * @param style 绘制的样式
     * @param font 绘制的字体
     */
    fillBoldText(name: CtxRefer, text: string, x: number, y: number, style: string, font: string): void

    /**
     * 绘制一个矩形。style可选为绘制样式
     * @param text 要绘制的文本
     * @param style 绘制的样式
     * @param font 绘制的字体
     */
    fillRect(name: CtxRefer, text: string, x: number, y: number, style: string, font: string): void


    /**
     * 绘制一个矩形的边框
     * @param style 绘制的样式
     */
    strokeRect(name: CtxRefer, x: number, y: number, width: number, height: number, style: string): void



    // core.ui.drawLine(name, x1, y1, x2, y2, style, lineWidth)
    // 绘制一条线。lineWidth可选为线宽。


    // core.ui.drawArrow(name, x1, y1, x2, y2, style, lineWidth)
    // 绘制一个箭头。


    // core.ui.setFont(name, font) / core.ui.setLineWidth(name, lineWidth)
    // 设置一个画布的字体/线宽。


    // core.ui.setAlpha(name, font) / core.ui.setOpacity(name, font)
    // 设置一个画布的绘制不透明度和画布本身的不透明度。
    // 两者区别如下：
    //  - setAlpha是设置"接下来绘制的内容的不透明度"，不会对已经绘制的内容产生影响。比如setAlpha('ui', 0.5)则会在接下来的绘制中使用0.5的不透明度。
    //  - setOpacity是设置"画布本身的不透明度"，已经绘制的内容也会产生影响。比如我已经在UI层绘制了一段文字，再setOpacity则也会看起来变得透明。
    // 尽量不要对系统画布使用setOpacity（因为会对已经绘制的内容产生影响），自定义创建的画布则不受此限制。


    // core.ui.setFillStyle(name, style) / core.ui.setStrokeStyle(name, style)
    // 设置一个画布的填充样式/描边样式。


    // core.ui.setTextAlign(name, align)
    // 设置一个画布的文字对齐模式。


    // core.ui.calWidth(name, text, font)
    // 计算一段文字在画布上的绘制宽度
    // font可选，如果存在则会先设置该画布上的字体。


    //---------------------//

    /**
     * 动态创建一个画布。name为要创建的画布名，如果已存在则会直接取用当前存在的。
     * x,y为创建的画布相对窗口左上角的像素坐标，width,height为创建的长宽。
     * zIndex为创建的纵向高度（关系到画布之间的覆盖），z值高的将覆盖z值低的；系统画布的z值可在个性化中查看。
     * 返回创建的画布的context，也可以通过core.dymCanvas[name]调用。
     * @param name 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     * @param zIndex 
     */
    createCanvas(name: string, x: number, y: number, width: number, height: number, zIndex: number): CanvasRenderingContext2D

    /** 重新定位一个自定义画布 */
    relocateCanvas(name: string, x: number, y: number): void


    /** 重新设置一个自定义画布的大小 */
    resizeCanvas(name: string, x: number, y: number): void

    /** 删除一个自定义画布 */
    deleteCanvas(name: string): void


    /** 清空所有的自定义画布 */
    deleteAllCanvas(): void


    /**
     * 绘制一个缩略图，比如楼传器界面，存读档界面等情况
     * @param floorId 目标楼层ID
     * @param canvas 绘制到的图层
     * @param blocks 绘制的所有图块
     * @param x 该图层开始绘制的起始点坐标
     * @param y 该图层开始绘制的起始点坐标
     * @param size 每一格的像素
     * @param heroLoc 勇士坐标
     * @param heroIcon 勇士图标
     */
    drawThumbnail(floorId: string, canvas: CtxRefer, blocks: any[], x: number, y: number, size: number, heroLoc: any, heroIcon: string): void

    /**
     *  在一个画布上绘制图片
     *  后面的8个坐标参数与canvas的drawImage的八个参数完全相同。
     *  请查看 http://www.w3school.com.cn/html5/canvas_drawimage.asp 了解更多。
     * @param name 可以是系统画布之一，也可以是任意自定义动态创建的画布名 画布名称或者画布的context
     * @param image 要绘制的图片，可以是一个全塔属性中定义的图片名（会从images中去获取），图片本身，或者一个画布。
     */
    drawImage(name: CtxRefer,
        image: CanvasImageSource | string, dx: number): void
    drawImage(name: CtxRefer,
        image: CanvasImageSource | string, dx: number, dy: number, dw: number, dh: number): void
    drawImage(name: CtxRefer,
        image: CanvasImageSource | string,
        sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void
}

/** 工具类 主要用来进行一些辅助函数的计算 */
declare class utils {


    /** 测试x是否不为null，不为undefined也不为NaN。*/
    isset(x: any): boolean

    /**
     * 使用伪种子生成伪随机数。该随机函数能被录像支持。
     * num如果设置大于0，则生成一个[0, num-1]之间的数；否则生成一个0到1之间的浮点数。
     * 此函数为伪随机算法，SL大法无效。（即多次SL后调用的该函数返回的值都是相同的。） 
     */
    rand(num: number): number

    /**
     * 
     * 使用系统的随机数算法得到的随机数。该随机函数能被录像支持。
     * num如果设置大于0，则生成一个[0, num-1]之间的数；否则生成一个0到2147483647之间的整数。
     * 此函数使用了系统的Math.random()函数，支持SL大法。
     * 但是，此函数会将生成的随机数值存入录像，因此如果调用次数太多则会导致录像文件过大。
     */
    rand2(num: number): number

    /** 自动切分长文本的换行。
     * @param canvas 图层
     * @param text 要自动换行的内容
     * @param maxLength 每行最长像素
     * @param font 文本的字体。
     */
    splitLines(canvas: CtxRefer, text: string, maxLength: number, font: string): void


    // core.utils.cropImage(image, size)
    // 纵向对图片进行切分（裁剪）。


    /** 向某个数组后插入另一个数组或元素 */
    push(a: any[], b: any[]): any[]


    /** 向某个数组前插入另一个数组或元素 */
    unshift(a: any[], b: any[]): any[]


    // core.utils.encodeBase64(str)
    // Base64加密字符串


    // core.utils.decodeBase64(str)
    // Base64解密字符串


    // core.utils.formatBigNumber(x, onMap)
    // 大数据的格式化


    /**
     * 检查b是否是a的从头开始子串。
     * 如果是，则返回a删去b的一段；否则返回null。
     */
    subarray(a: any[], b: any[]): any[]

    /** 比较a和b两个对象是否相同 */
    same(a: any, b: any): boolean


    /** 将x限制在[a,b]之间的范围内 */
    clamp(x: number, a: number, b: number): number


    /** 将形如[255,0,0]之类的数组转成#FF0000这样的RGB形式。 */
    arrayToRGB(color: number[]): string


    /** 将形如[255,0,0,1]之类的数组转成rgba(255,0,0,1)这样的RGBA形式。 */
    arrayToRGBA(color: number[]): string


    // core.utils.encodeRoute(list)
    // 压缩加密路线。可以使用core.encodeRoute(core.status.route)来压缩当前路线。


    // core.utils.decodeRoute(route)
    // 解压缩（解密）路线。


    // core.utils.readFile(success, error, readType)    [异步]
    // 尝试请求读取一个本地文件内容。
    // success和error为成功/失败后的回调，readType不设置则以文本读取，否则以DataUrl形式读取。


    // core.utils.readFileContent(content)    [异步]
    // 文件读取完毕后的内容处理。


    // core.utils.download(filename, content)
    // 尝试生成并下载一个文件。


    // core.utils.copy(data)
    // 尝试复制一段文本到剪切板。


    // core.utils.http(type, url, formData, success, error)    [异步]
    // 发送一个异步HTTP请求。
    // type为'GET'或者'POST'；url为目标地址；formData如果是POST请求则为表单数据。
    // success为成功后的回调，error为失败后的回调。
    /** 深拷贝某个对象。*/
    clone<T>(data: T): T
}

interface map {

}

interface gameStatus {
    /** 当前层的floorId */
    floorId: string,
    /** 获得所有楼层的地图信息 */
    maps: { [key: string]: map },
    /** 获得当前楼层信息，等价于core.status.maps[core.status.floorId] */
    thisMap: map,
    /** 获得所有楼层的信息
     *  @example core.floors[core.status.floorId].events // 获得本楼层的所有自定义事件
     */
    floors: { [key: string]: map },
    /** 获得当前勇士状态信息。例如core.status.hero.atk就是当前勇士的攻击力数值 */
    hero: {
        atk: number
    },
}

type core = {
    /** 游戏状态 */ status: gameStatus

    /** 游戏资源 */
    material: {
        /** 
         * 怪物信息
         * @example core.material.enemys.greenSlime // 获得绿色史莱姆的属性数据
         */
        enemys: { [key: string]: enemy },
        /** 道具信息 */
        items: {}
    }

    /**
     * 开启调试模式, 此模式下可以按Ctrl键进行穿墙, 并忽略一切事件。
     * 此模式下不可回放录像和上传成绩。
     */
    debug(): void

    /**
     * 立刻刷新状态栏和地图显伤
     */
    updateStatusBar(): void

    /**
     * 设置角色属性
     * @example core.setStatus('atk', 1000) // 将攻击力设置为1000
     * @param name 属性名称, 如hp, atk, def, mdef, money, experience
     * @param value 属性的值
     */
    setStatus(name: string, value: any): void

    /**
     * 获取角色属性
     * @example core.getStatus('atk') // 返回当前攻击力数值
     * @param name 属性名称
     */
    getStatus(name: string): any

    /**
     * 设置勇士位置
     * 值得注意的是，这句话虽然会使勇士改变位置，但并不会使界面重新绘制；
     * 如需立刻重新绘制地图还需调用：core.clearMap('hero'); core.drawHero(); 来对界面进行更新。
     * @example core.setHeroLoc('x', 5) // 将勇士当前位置的横坐标设置为5。
     * @param name 要设置的坐标属性
     * @param value 新值
     * @param noGather 是否聚集跟随者 
     */
    setHeroLoc(name: 'x' | 'y' | 'direction',
        value: number | string, noGather?: boolean): void

    control: control
    enemys: enemys
    items: items
    ui: ui
    utils: utils

} & control & enemys & items & ui & utils

declare var core: core
/*




core.insertAction(list, x, y, callback)
插入并执行一段自定义事件。在这里你可以写任意的自定义事件列表，有关详细写法请参见文档-事件。
x和y如果设置则覆盖"当前事件点"的坐标，callback如果设置则覆盖事件执行完毕后的回调函数。
例如： core.insertAction(["楼层切换", {"type":"changeFloor", "floorId": "MT3"}])
将依次显示剧情文本，并执行一个楼层切换的自定义事件。
--------
从V2.5.4开始提出了“公共事件”的说法，这里也可以插入一个公共事件名。
例如：core.insertAction("毒衰咒处理") 将插入公共事件“毒衰咒处理”。


core.changeFloor(floorId, stair, heroLoc, time, callback)    [异步]
立刻切换到指定楼层。
floorId为目标楼层ID，stair为到达的目标楼梯，heroLoc为到达的指定点，time为动画时间，callback为切换完毕后的回调。
例如：
core.changeFloor('MT2', 'upFloor', null, 600) 切换到MT2层的上楼点，动画事件600ms
core.changeFloor('MT5', null, {'x': 3, 'y': 6}, 0) 无动画切换到MT5层的(3,6)位置。


core.resetMap()
重置当前楼层地图和楼层属性。
此函数参数有三种形式：
 - 不加任何参数，表示重置当前层：core.resetMap()
 - 加上一个floorId，表示重置某一层：core.resetMap("MT1")
 - 使用一个数组，表示重置若干层：core.resetMap(["MT1", "MT2", "MT3"])
---------------------------
** 说明：从V2.5.5开始存档方式发生了改变，在编辑器修改了地图后现在将直接生效，无需再重置地图。

!> 一些相对高级的命令，针对有一定脚本经验的人

``` text

========== 可直接从core中调用的，最常被使用的函数 ==========
core.js实际上是所有API的入口（路由），核心API的实现在其他几个文件中，core.js主要进行转发操作。


core.nextX(n)
获得勇士面向的第n个位置的x坐标，n可以省略默认为1（即正前方）


core.nextY(n)
获得勇士面向的第n个位置的y坐标，n可以省略默认为1（即正前方）


core.nearHero(x, y)
判断某个点是否和勇士的距离不超过1。


core.openDoor(id, x, y, needKey, callback)    [异步]
尝试开门操作。id为目标点的ID，x和y为坐标，needKey表示是否需要使用钥匙，callback为开门完毕后的回调函数。
id可为null代表使用地图上的值。
例如：core.openDoor('yellowDoor', 10, 3, false, function() {console.log("1")})
此函数返回true代表成功开门，并将执行callback回调；返回false代表无法开门，且不会执行回调函数。


core.battle(id, x, y, force, callback)    [异步]
执行战斗事件。id为怪物的id，x和y为坐标，force为bool值表示是否是强制战斗，callback为战斗完毕后的回调函数。
id可为null代表使用地图上的值。
例如：core.battle('greenSlime', null, null, true)


core.trigger(x, y)    [异步]
触发某个地点的事件。


core.isReplaying()
当前是否正在录像播放中


core.drawBlock(block)
重绘某个图块。block应为core.status.thisMap.blocks中的一项。


core.drawMap(floorId, callback)
重绘某一层的地图。floorId为要绘制楼层的floorId，callback为绘制完毕后的回调函数。


core.terrainExists(x, y, id, floorId)
检测某个点是否存在（指定的）地形。
x和y为坐标；id为地形ID，可为null表示任意地形；floorId为楼层ID，可忽略表示当前楼层。


core.enemyExists(x, y, id, floorId)
检测某个点是否存在（指定的）怪物。
x和y为坐标；id为怪物ID，可为null表示任意怪物；floorId为楼层ID，可忽略表示当前楼层。


core.getBlock(x, y, floorId, showDisable)
获得某个点的当前图块信息。
x和y为坐标；floorId为楼层ID，可忽略或null表示当前楼层。
showDisable如果为true，则对于禁用的点和事件也会进行返回。
如果该点不存在图块，则返回null。
否则，返回值如下： {"index": xxx, "block": xxx}
其中index为该点在该楼层blocks数组中的索引，block为该图块实际内容。


core.getBlockId(x, y, floorId, showDisable)
获得某个点的图块ID。
x和y为坐标；floorId为楼层ID，可忽略或null表示当前楼层。
showDisable如果为true，则对于禁用的点和事件也会进行返回。
如果该点不存在图块，则返回null，否则返回该点的图块ID。


core.getBlockCls(x, y, floorId, showDisable)
获得某个点的图块cls。
x和y为坐标；floorId为楼层ID，可忽略或null表示当前楼层。
showDisable如果为true，则对于禁用的点和事件也会进行返回。
如果该点不存在图块，则返回null，否则返回该点的图块cls。


core.showBlock(x, y, floorId)
将某个点从禁用变成启用状态。


core.hideBlock(x, y, floorId)
将某个点从启用变成禁用状态，但不会对其进行删除。
此函数不会实际将该块从地图中进行删除，而是将该点设置为禁用，以供以后可能的启用事件。


core.removeBlock(x, y, floorId)
将从启用变成禁用状态，并尽可能将其从地图上删除。
和hideBlock相比，如果该点不存在自定义事件（比如门或普通的怪物），则将直接从地图中删除。
如果存在自定义事件，则简单的禁用它，以供以后可能的启用事件。


core.setBlock(number, x, y, floorId)
改变图块。number为要改变到的图块数字，x和y为坐标，floorId为楼层ID，可忽略表示当前楼层。


core.useItem(itemId, noRoute, callback)
尝试使用某个道具。itemId为道具ID，noRoute如果为真则该道具的使用不计入录像。
callback为成功或失败后的回调。


core.canUseItem(itemId)
返回当前能否使用某个道具。


core.loadEquip(itemId, callback)
装备上某个装备。itemId为装备的ID，callback为成功或失败后的回调。


core.unloadEquip(equipType, callback)
卸下某个部位的装备。equipType为装备类型，从0开始；callback为成功或失败后的回调。


core.getNextItem()
轻按。


core.drawTip(text, itemIcon)
在左上角绘制一段提示信息，2秒后消失。itemIcon为道具图标的索引。


core.drawText(contents, callback)    [异步]
绘制一段文字。
不推荐使用此函数，尽量使用core.insertAction(contents)来显示剧情文本。


core.closePanel()
结束一切事件和绘制，关闭UI窗口，返回游戏进程。


core.replaceText(text)
将一段文字中的${}进行计算并替换。


core.calValue(value, prefix, need, times)
计算表达式的实际值。这个函数可以传入status:atk等这样的参数。


core.getLocalStorage(key, defaultValue)
从localStorage中获得某个数据（已被parse）；如果对应的key不存在则返回defaultValue。


core.getLocalForage(key, defaultValue, successCallback, errorCallback)
从localForage中获得某个数据（已被parse），如果对应的key不存在则返回defaultValue。
如果成功则通过successCallback回调，失败则通过errorCallback回调。


core.hasSave(index)
判定当前某个存档位是否存在存档，返回true/false。
index为存档编号，0代表自动存档，大于0则为正常的存档位。


core.restart()    [异步]
返回标题界面。


========== core.actions.XXX 和游戏控制相关的函数 ==========
actions.js主要用来进行用户交互行为的处理。
所有用户行为，比如按键、点击、滑动等等，都会被此文件接收并进行操作。




========== core.enemys.XXX 和怪物相关的函数 ==========
enemys.js主要用来进行怪物相关的内容，比如怪物的特殊属性，伤害和临界计算等。


core.enemys.hasSpecial(special, test)
测试怪物是否含有某个特殊属性。
常见用法： core.enemys.hasSpecial(monster.special, 3)  ## 测试是否拥有坚固


core.enemys.getSpecialText(enemyId)
返回一个列表，包含该怪物ID对应的所有特殊属性。


core.enemys.getSpecialHint(enemy, special)
获得怪物某个（或全部）特殊属性的文字说明。


core.enemys.canBattle(enemyId, x, y, floorId)
返回当前能否战胜某个怪物。
后面三个参数是怪物坐标和楼层。


core.enemys.getDamage(enemyId, x, y, floorId)
返回当前对某个怪物的战斗伤害。如果无法战斗，返回null。
后面三个参数是怪物坐标和楼层。


core.enemys.getExtraDamage(enemyId)
返回某个怪物会对勇士造成的额外伤害（不可被魔防抵消），例如仇恨、固伤等等。


core.enemys.nextCriticals(enemyId, number, x, y, floorId)
返回一个列表，为接下来number（可忽略，默认为1）个该怪物的临界值和临界减伤。
列表每一项类似 [x,y] 表示临界值为x，且临界减伤为y。
如果无临界值，则返回空列表。


core.enemys.getDefDamage(enemyId, k, x, y, floorId)
获得k（可忽略，默认为1）防减伤值。


core.enemys.getDamageInfo(enemy, hero_hp, hero_atk, hero_def, hero_mdef, x, y, floorId)
获得实际战斗信息，比如伤害，回合数，每回合伤害等等。
此函数是实际战斗过程的计算。


core.enemys.calDamage(enemy, hero_hp, hero_atk, hero_def, hero_mdef, x, y, floorId)
获得在某个勇士属性下怪物伤害；实际返回的是上面getDamageInfo中伤害的数值。


core.enemys.getCurrentEnemys(floorId)
获得某一层楼剩余所有怪物的信息（供怪物手册使用）


========== core.events.XXX 和事件相关的函数 ==========
events.js主要用来进行事件处理，比如自定义事件，以及某些条件下可能会被触发的事件。
大多数事件API都在脚本编辑中存在，这里只列出部分比较重要的脚本编辑中不存在的API。


core.events.gameOver(ending, fromReplay)
游戏结束并上传的事件。
该函数将提问是否上传和是否下载录像，并返回标题界面。


core.events.doEvents(list, x, y, callback)    [异步]
开始执行某个事件。
请不要执行此函数，尽量使用 core.insertAction(list, x, y, callback) 来开始执行一段事件。


core.events.doAction()
执行下一个事件。此函数中将对所有自定义事件类型分别处理。


core.events.getCommonEvent(name)
根据名称获得一个公共事件；如果不存在对应的公共事件则返回null。


core.events.openShop(shopId, needVisited)    [异步]
打开一个全局商店。needVisited表示是否需要该商店已被打开过。


core.events.disableQuickShop(shopId)
禁用一个全局商店


core.events.canUseQuickShop(shopId)
当前能否使用某个快捷商店


core.events.setHeroIcon(name)
设置勇士行走图


========== core.items.XXX 和道具相关的函数 ==========
items.js将处理和道具相关的内容，比如道具的使用，获取和删除等等。


core.items.compareEquipment(equipId1, equipId2)
比较两个装备的属性变化值


========== core.loader.XXX 和游戏加载相关的函数 ==========
loader.js将主要用来进行资源的加载，比如加载音乐、图片、动画等等。


========== core.maps.XXX 和地图处理相关的函数 ==========
maps.js主要用来进行地图相关的的操作。包括绘制地图，获取地图上的点等等。


core.maps.getNumberById(id)
根据ID来获得对应的数字。如果该ID不存在对应的数字则返回0。


core.maps.canMoveHero(x,y,direction,floorId)
判断能否前往某个方向。x,y为坐标，可忽略为当前点；direction为方向，可忽略为当前方向。
floorId为楼层ID，可忽略为当前楼层。


core.maps.canMoveDirectly(destX, destY)
判断当前能否瞬间移动到某个点。
该函数如果返回0则不可瞬间移动，大于0则可以瞬间移动，且返回值是跨度（即少走的步数）。


core.maps.removeBlockById(index, floorId)
根据索引删除或禁用某块。


core.maps.removeBlockByIds(floorId, ids)
根据索引删除或禁用若干块。


core.maps.drawAnimate(name, x, y, callback)
播放一段动画，name为动画名（需在全塔属性注册），x和y为坐标（0-12之间），callback可选，为播放完毕的回调函数。
播放过程是异步的，如需等待播放完毕请使用insertAction插入一条type:waitAsync事件。
此函数将随机返回一个数字id，为此异步动画的唯一标识符。


core.maps.stopAnimate(id, doCallback)
立刻停止一个异步动画。
id为该动画的唯一标识符（由drawAnimate函数返回），doCallback可选，若为true则会执行该动画所绑定的回调函数。


*/