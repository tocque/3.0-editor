function main() {

    this.version = String(/* @echo VERSION */) || '3.0.0'; // 游戏版本号；如果更改了游戏内容建议修改此version以免造成缓存问题。

    this.useCompress = Boolean(/* @echo PRODUCTION */); // 是否使用压缩文件
    // 只有useCompress是false时才会读取floors目录下的文件，为true时会直接读取libs目录下的floors.min.js文件。

    this.bgmRemote = Boolean(/* @echo BGMREMOTE */); // 是否采用远程BGM
    this.bgmRemoteRoot = "https://h5mota.com/music/"; // 远程BGM的根目录

    this.isCompetition = false; // 是否是比赛模式

    this.savePages = 1000; // 存档页数，每页可存5个；默认为1000页5000个存档

    this.mode = 'play';
    this.libs = [
        'loader', 'control', 'utils', 'items', 'icons','sprite', 'scenes', 'maps', 'enemys', 'events', 'actions', 'data', 'ui', 'core'
    ];
    this.pureData = [ 
        'data', 'enemys', 'icons', 'maps', 'items', 'events', 'default'
    ];
    this.functions = [
        'plugins', 'functions',
    ];
    this.materials = [
        'icons', 'fog', 
    ];

    this.floors = {};
    this.canvas = {};
    this.gameData = {};

    this.__VERSION__ = "2.6.4";
    this.__VERSION_CODE__ = 78;
}

main.prototype.bindDOM = function () {
    this.dom = {
        'body': document.body,
        'gameGroup': document.getElementById('gameGroup'),
        'mainTips': document.getElementById('mainTips'),
        'musicBtn': document.getElementById('musicBtn'),
        'startPanel': document.getElementById('startPanel'),
        'startTop': document.getElementById('startTop'),
        'startTopProgressBar': document.getElementById('startTopProgressBar'),
        'startTopProgress': document.getElementById('startTopProgress'),
        'startTopLoadTips': document.getElementById('startTopLoadTips'),
        'startBackground': document.getElementById('startBackground'),
        'startLogo': document.getElementById('startLogo'),
        'startButtonGroup': document.getElementById('startButtonGroup'),
        'floorMsgGroup': document.getElementById('floorMsgGroup'),
        'logoLabel': document.getElementById('logoLabel'),
        'versionLabel': document.getElementById('versionLabel'),
        'floorNameLabel': document.getElementById('floorNameLabel'),
        'statusBar': document.getElementById('statusBar'),
        'status': document.getElementsByClassName('status'),
        'toolBar': document.getElementById('toolBar'),
        'tools': document.getElementsByClassName('tools'),
        'gameCanvas': document.getElementsByClassName('gameCanvas'),
        'gif': document.getElementById('gif'),
        'gif2': document.getElementById('gif2'),
        'gameDraw': document.getElementById('gameDraw'),
        'startButtons': document.getElementById('startButtons'),
        'playGame': document.getElementById('playGame'),
        'loadGame': document.getElementById('loadGame'),
        'replayGame': document.getElementById('replayGame'),
        'levelChooseButtons': document.getElementById('levelChooseButtons'),
        'data': document.getElementById('data'),
        'statusLabels': document.getElementsByClassName('statusLabel'),
        'statusTexts': document.getElementsByClassName('statusText'),
        'floorCol': document.getElementById('floorCol'),
        'nameCol': document.getElementById('nameCol'),
        'lvCol': document.getElementById('lvCol'),
        'hpmaxCol': document.getElementById('hpmaxCol'),
        'hpCol': document.getElementById('hpCol'),
        'manaCol': document.getElementById('manaCol'),
        'atkCol': document.getElementById('atkCol'),
        'defCol': document.getElementById('defCol'),
        'mdefCol': document.getElementById('mdefCol'),
        'moneyCol': document.getElementById('moneyCol'),
        'experienceCol': document.getElementById('experienceCol'),
        'upCol': document.getElementById('upCol'),
        'keyCol': document.getElementById('keyCol'),
        'pzfCol': document.getElementById('pzfCol'),
        'debuffCol': document.getElementById('debuffCol'),
        'skillCol': document.getElementById('skillCol'),
        'hard': document.getElementById('hard'),
        'statusCanvas': document.getElementById('statusCanvas'),
        'statusCanvasCtx': document.getElementById('statusCanvas').getContext('2d'),
        'inputDiv': document.getElementById('inputDiv'),
        'inputMessage': document.getElementById('inputMessage'),
        'inputBox': document.getElementById('inputBox'),
        'inputYes': document.getElementById('inputYes'),
        'inputNo': document.getElementById('inputNo'),
        'next': document.getElementById('next')
    };

    var icons = [
        'floor', 'name', 'lv', 'hpmax', 'hp', 'mana', 
        'atk', 'def', 'mdef', 'money', 'experience', 'up', 'skill', 
        'book', 'fly', 'toolbox', 'keyboard', 'shop', 'save', 'load', 'settings',
        'btn1', 'btn2', 'btn3', 'btn4', 'btn5', 'btn6', 'btn7', 'btn8',
    ]

    this.statusBar = {
        'image': function(icons) {
            var doms = {};
            for (var i = 0; i < icons.length; i++) {
                doms[icons[i]] = document.getElementById("img-"+icons[i]);
            }
            return doms;
        }(icons),
        'icons': {
            'floor': 0,
            'name': null,
            'lv': 1,
            'hpmax': 2,
            'hp': 3,
            'atk': 4,
            'def': 5,
            'mdef': 6,
            'money': 7,
            'experience': 8,
            'up': 9,
            'book': 10,
            'fly': 11,
            'toolbox': 12,
            'keyboard': 13,
            'shop': 14,
            'save': 15,
            'load': 16,
            'settings': 17,
            'play': 18,
            'pause': 19,
            'stop': 20,
            'speedDown': 21,
            'speedUp': 22,
            'rewind': 23,
            'equipbox': 24,
            'mana': 25,
            'skill': 26,
            'paint': 27,
            'erase': 28,
            'empty': 29,
            'exit': 30,
            'btn1': 31,
            'btn2': 32,
            'btn3': 33,
            'btn4': 34,
            'btn5': 35,
            'btn6': 36,
            'btn7': 37,
            'btn8': 38
        },
        'floor': document.getElementById('floor'),
        'name': document.getElementById('name'),
        'lv': document.getElementById('lv'),
        'hpmax': document.getElementById('hpmax'),
        'hp': document.getElementById('hp'),
        'mana': document.getElementById('mana'),
        'atk': document.getElementById('atk'),
        'def': document.getElementById("def"),
        'mdef': document.getElementById('mdef'),
        'money': document.getElementById("money"),
        'experience': document.getElementById("experience"),
        'up': document.getElementById('up'),
        'skill': document.getElementById('skill'),
        'yellowKey': document.getElementById("yellowKey"),
        'blueKey': document.getElementById("blueKey"),
        'redKey': document.getElementById("redKey"),
        'poison': document.getElementById('poison'),
        'weak':document.getElementById('weak'),
        'curse': document.getElementById('curse'),
        'pickaxe': document.getElementById('pickaxe'),
        'bomb': document.getElementById('bomb'),
        'fly': document.getElementById('fly'),
        'hard': document.getElementById("hard")
    }
}

main.prototype.init = async function (mode) {
    main.bindDOM();
    for (let canvas of main.dom.gameCanvas) {
        main.canvas[canvas.id] = canvas.getContext('2d');
    }
    main.mode = mode;
    main.setMainTipsText('正在加载数据文件...');
    const data = await main.loadProject(main.pureData, main.functions);
    for (let ii in data) main.gameData[ii] = data[ii];
    for (let ii in data.data.main) main[ii] = data.data.main[ii];

    main.setMainTipsText('正在加载核心js文件...');
    await main.loadLibs(main.libs);
    main.core = core;

    for (let lib of main.libs) {
        if (lib === 'core') continue;
        main.core[lib] = new window[lib]();
    }

    main.setMainTipsText('正在加载楼层文件...');
    main.floors = await main.loadFloors(main.floorIds);
    main.dom.mainTips.style.display = 'none';

    const coreData = {};
    ["dom", "statusBar", "canvas", "floorIds", "floors"].forEach((t) => {
        coreData[t] = main[t];
    })
    coreData.loadList = {
        materials: main.materials
    };
    [
        "enemys", "items", "events",  "tilesets", "autotiles", 
        "images", "animates", "bgms", "sounds"
    ].forEach((t) => {
        coreData.loadList[t] = main[t];
    })
    await main.core.init(coreData);
    main.core.resize();
}

main.prototype.loadProject = function (pureData, functions) {
    const request = [];
    if (this.useCompress) {
        request.push(axios.get('project/project.min.json?v='+this.version));
        request.push(main.loadJs('project/', 'project.min'));
    } else {
        request.push(...pureData.map((e) => {
            return axios.get('project/'+e+'.json?v='+this.version);
        }))
        request.push(...functions.map((e) => main.loadJs('project/', e)));
    }
    return Promise.all(request).then((res) => {
        if (this.useCompress) return res[0].data;
        const data = {};
        for (let i = 0; i < pureData.length; i++) {
            data[pureData[i]] = res[i].data;
        }
        return data;
    })
}

////// 动态加载所有核心JS文件 //////
main.prototype.loadLibs = function (loadList) {

    if (this.useCompress) {
        return main.loadJs('libs/', 'libs.min');
    }
    else {
        const request = loadList.map((e) => {
            return main.loadJs('libs/', e).then((lib) => {
                main.setMainTipsText(lib + '.js 加载完毕');
            })
        });
        return Promise.all(request);
    }
}

////// 加载某一个JS文件 //////
main.prototype.loadJs = function (dir, name) {
    const script = document.createElement('script');
    script.src = dir + name + '.js?v=' + this.version;
    return new Promise((res) => {
        script.onload = function () {
            res(name);
        }
        main.dom.body.appendChild(script);
    })
}

////// 动态加载所有楼层（剧本） //////
main.prototype.loadFloors = function (loadList) {

    if (this.useCompress) { // 读取压缩文件
        return axios.get('project/floors.min.json?v=' + this.version).then(res => res.data)
    }
    else {
        const request = loadList.map((e) => {
            return axios.get('project/floors/'+e+'.json?v='+this.version)
                .then((res) => {
                    main.setMainTipsText("楼层 " + e + '.json 加载完毕');
                    return res.data;
                })
        })
        return Promise.all(request).then((res) => {
            const floors = {};
            for (let i = 0; i < loadList.length; i++) {
                floors[loadList[i]] = res[i];
            }
            return floors;
        })
    }
}

////// 加载过程提示 //////
main.prototype.setMainTipsText = function (text) {
    main.dom.mainTips.innerHTML = text;
}

main.prototype.log = function (e) {
    if (e) {
        if (main.core && main.core.platform && !main.core.platform.isPC) {
            console.log((e.stack || e.toString()));
        }
        else {
            console.log(e);
        }
    }
}

main.prototype.createOnChoiceAnimation = function () {
    var borderColor = main.dom.startButtonGroup.style.caretColor || "rgb(255, 215, 0)";
    // get rgb value
    var rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+\s*)?\)$/.exec(borderColor);
    if (rgb != null) {
        var value = rgb[1] + ", " + rgb[2] + ", " + rgb[3];
        var style = document.createElement("style");
        style.type = 'text/css';
        var keyFrames = "onChoice { " +
            "0% { border-color: rgba("+value+", 0.9); } " +
            "50% { border-color: rgba("+value+", 0.3); } " +
            "100% { border-color: rgba("+value+", 0.9); } " +
            "}";
        style.innerHTML = "@-webkit-keyframes " + keyFrames + " @keyframes " + keyFrames;
        document.body.appendChild(style);
    }
}

////// 选项 //////
main.prototype.selectButton = function (index) {
    var select = function (children) {
        index = (index + children.length) % children.length;
        for (var i = 0;i < children.length; ++i) {
            children[i].classList.remove("onChoiceAnimate");
        }
        children[index].classList.add("onChoiceAnimate");
        if (main.selectedButton == index) {
            children[index].click();
        }
        else {
            main.selectedButton = index;
        }
    }

    if (core.dom.startPanel.style.display != 'block') return;

    if (main.dom.startButtons.style.display == 'block') {
        select(main.dom.startButtons.children);
    }
    else if (main.dom.levelChooseButtons.style.display == 'block') {
        select(main.dom.levelChooseButtons.children);
    }
}

main.prototype.listen = function () {

////// 窗口大小变化时 //////
window.onresize = function () {
    try {
        main.core.resize();
    }catch (e) { main.log(e); }
}

////// 在界面上按下某按键时 //////
main.dom.body.onkeydown = function(e) {
    try {
        if (main.dom.inputDiv.style.display == 'block') return;
        if (main.core && (main.core.isPlaying() || main.core.status.lockControl))
            main.core.onkeyDown(e);
    } catch (ee) { main.log(ee); }
}

////// 在界面上放开某按键时 //////
main.dom.body.onkeyup = function(e) {
    try {
        if (main.dom.startPanel.style.display == 'block' &&
            (main.dom.startButtons.style.display == 'block' || main.dom.levelChooseButtons.style.display == 'block')) {
            if (e.keyCode == 38 || e.keyCode == 33) // up/pgup
                main.selectButton((main.selectedButton||0) - 1);
            else if (e.keyCode == 40 || e.keyCode == 34) // down/pgdn
                main.selectButton((main.selectedButton||0) + 1);
            else if (e.keyCode == 67 || e.keyCode == 13 || e.keyCode == 32) // C/Enter/Space
                main.selectButton(main.selectedButton);
            else if (e.keyCode == 27 && main.dom.levelChooseButtons.style.display == 'block') { // ESC
                main.core.showStartAnimate(true);
            }
            e.stopPropagation();
            return;
        }
        if (main.dom.inputDiv.style.display == 'block') {
            if (e.keyCode == 13) {
                setTimeout(function () {
                    main.dom.inputYes.click();
                }, 50);
            }
            else if (e.keyCode == 27) {
                setTimeout(function () {
                    main.dom.inputNo.click();
                }, 50);
            }
            return;
        }
        if (main.core && main.core.isPlaying && main.core.status &&
            (main.core.isPlaying() || main.core.status.lockControl))
            main.core.onkeyUp(e);
    } catch (ee) { main.log(ee); }
}

////// 开始选择时 //////
main.dom.body.onselectstart = function () {
    return false;
}

////// 鼠标按下时 //////
main.dom.data.onmousedown = function (e) {
    try {
        e.stopPropagation();
        var loc = main.core.actions._getClickLoc(e.clientX, e.clientY);
        if (loc == null) return;
        main.core.ondown(loc);
    } catch (ee) { main.log(ee); }
}

////// 鼠标移动时 //////
main.dom.data.onmousemove = function (e) {
    try {
        e.stopPropagation();
        var loc = main.core.actions._getClickLoc(e.clientX, e.clientY);
        if (loc == null) return;
        main.core.onmove(loc);
    }catch (ee) { main.log(ee); }
}

////// 鼠标放开时 //////
main.dom.data.onmouseup = function () {
    try {
        main.core.onup();
    }catch (e) { main.log(e); }
}

////// 鼠标滑轮滚动时 //////
main.dom.data.onmousewheel = function(e) {
    try {
        if (e.wheelDelta)
            main.core.onmousewheel(Math.sign(e.wheelDelta))
        else if (e.detail)
            main.core.onmousewheel(Math.sign(e.detail));
    } catch (ee) { main.log(ee); }
}

////// 手指在触摸屏开始触摸时 //////
main.dom.data.ontouchstart = function (e) {
    try {
        e.preventDefault();
        var loc = main.core.actions._getClickLoc(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        if (loc == null) return;
        main.core.ondown(loc);
    }catch (ee) { main.log(ee); }
}

////// 手指在触摸屏上移动时 //////
main.dom.data.ontouchmove = function (e) {
    try {
        e.preventDefault();
        var loc = main.core.actions._getClickLoc(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        if (loc == null) return;
        main.core.onmove(loc);
    }catch (ee) { main.log(ee); }
}

////// 手指离开触摸屏时 //////
main.dom.data.ontouchend = function (e) {
    try {
        e.preventDefault();
        main.core.onup();
    } catch (e) {
        main.log(e);
    }
}

////// 点击状态栏中的怪物手册时 //////
main.statusBar.image.book.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.triggerReplay();
        return;
    }

    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.setPaintMode('paint');
        return;
    }

    if (main.core.isPlaying())
        main.core.openBook(true);
}

////// 点击状态栏中的楼层传送器/装备栏时 //////
main.statusBar.image.fly.onclick = function (e) {
    e.stopPropagation();

    // 播放录像时
    if (core.isReplaying()) {
        core.stopReplay();
        return;
    }

    // 绘图模式
    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.setPaintMode('erase');
        return;
    }

    if (main.core.isPlaying()) {
        if (!main.core.flags.equipboxButton) {
            main.core.useFly(true);
        }
        else {
            main.core.openEquipbox(true)
        }
    }
}

////// 点击状态栏中的工具箱时 //////
main.statusBar.image.toolbox.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.rewindReplay();
        return;
    }

    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.clearPaint();
        return;
    }

    if (main.core.isPlaying()) {
        main.core.openToolbox(core.status.event.id != 'equipbox');
    }
}

////// 双击状态栏中的工具箱时 //////
main.statusBar.image.toolbox.ondblclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        return;
    }

    if (main.core.isPlaying())
        main.core.openEquipbox(true);

}

////// 点击状态栏中的虚拟键盘时 //////
main.statusBar.image.keyboard.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.bookReplay();
        return;
    }

    if (main.core.isPlaying())
        main.core.openKeyBoard(true);
}

////// 点击状态栏中的快捷商店键盘时 //////
main.statusBar.image.shop.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.viewMapReplay();
        return;
    }

    if (main.core.isPlaying())
        main.core.openQuickShop(true);
}

////// 点击金币时也可以开启虚拟键盘 //////
main.statusBar.image.money.onclick = function (e) {
    e.stopPropagation();

    if (main.core.isPlaying())
        main.core.openQuickShop(true);
}

////// 点击状态栏中的存档按钮时 //////
main.statusBar.image.save.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.speedDownReplay();
        return;
    }

    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.savePaint();
        return;
    }

    if (main.core.isPlaying())
        main.core.save(true);
}

////// 点击状态栏中的读档按钮时 //////
main.statusBar.image.load.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.speedUpReplay();
        return;
    }

    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.loadPaint();
        return;
    }

    if (main.core.isPlaying())
        main.core.load(true);
}

////// 点击状态栏中的系统菜单时 //////
main.statusBar.image.settings.onclick = function (e) {
    e.stopPropagation();

    if (core.isReplaying()) {
        core.saveReplay();
        return;
    }

    if (main.core.isPlaying() && (core.status.event||{}).id=='paint') {
        core.actions.exitPaint();
        return;
    }

    if (main.core.isPlaying())
        main.core.openSettings(true);
}

////// 点击工具栏时 //////
main.dom.hard.onclick = function () {
    if (core.isReplaying())
        return;
    main.core.control.setToolbarButton(!core.domStyle.toolbarBtn);
}

////// 手机端的按钮1-7 //////
main.statusBar.image.btn1.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 49});
};

main.statusBar.image.btn2.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 50});
};

main.statusBar.image.btn3.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 51});
};

main.statusBar.image.btn4.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 52});
};

main.statusBar.image.btn5.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 53});
};

main.statusBar.image.btn6.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 54});
};

main.statusBar.image.btn7.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 55});
};

main.statusBar.image.btn8.onclick = function (e) {
    e.stopPropagation();
    main.core.onkeyUp({"keyCode": 56});
};

////// 点击“开始游戏”时 //////
main.dom.playGame.onclick = function () {
    main.dom.startButtons.style.display='none';
    main.core.control.checkBgm();

    if (main.core.isset(main.core.flags.startDirectly) && main.core.flags.startDirectly) {
        core.events.startGame("");
    }
    else {
        main.dom.levelChooseButtons.style.display='block';
        main.selectedButton = null;
        main.selectButton(0);
    }
}

////// 点击“载入游戏”时 //////
main.dom.loadGame.onclick = function() {
    main.core.control.checkBgm();
    main.core.load();
}

////// 点击“录像回放”时 //////
main.dom.replayGame.onclick = function () {
    main.core.control.checkBgm();
    main.core.chooseReplayFile();
}

main.dom.musicBtn.onclick = function () {
    try {
        if (main.core)
            main.core.triggerBgm();
    } catch (e) {main.log(e);}
}

window.onblur = function () {
    if (main.core && main.core.control) {
        try {
            main.core.control.checkAutosave();
        } catch (e) {}
    }
}

main.dom.inputYes.onclick = function () {
    main.dom.inputDiv.style.display = 'none';
    var func = core.platform.successCallback;
    core.platform.successCallback = core.platform.errorCallback = null;
    if (func) func(main.dom.inputBox.value);
}

main.dom.inputNo.onclick = function () {
    main.dom.inputDiv.style.display = 'none';
    var func = core.platform.errorCallback;
    core.platform.successCallback = core.platform.errorCallback = null;
    if (func) func(null);
}

}//listen end

main = new main();