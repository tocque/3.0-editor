/**
 * editor_game.js 游戏运行时的类
 * 原则上其他部分获取游戏信息均需要通过此处, 若玩家自行修改游戏, 对应获取信息的更改也均在此处调整
 */

import { ftools, jsFile } from "./editor_file.js";
import { createGuid } from "./editor_util.js";

const project = {
    data: "_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d",
    maps: "_90f36752_8815_4be8_b32b_d7fad1d0542e",
    items: "_296f5d02_12fd_4166_a7c1_b5e830c9ee3a",
    icons: "_4665ee12_3a1f_44a4_bea3_0fccba634dc1",
    enemys: "_fcae963b_31c9_42b4_b48c_bb48d09f3f80",
    events: "_c12a15a8_c380_4b28_8144_256cba95f760",
    plugins: "_bb40132b_638b_4a9f_b028_d3fe47acc8d1",
    functions: "_d6ad677b_427a_4623_b50f_a445a3b0ef8a",
}

const defaultMap = {
    "floorId": "to be covered",
    "title": "new floor",
    "name": "new floor",
    "width": 13,
    "height": 13,
    "canFlyTo": true,
    "canUseQuickShop": true,
    "cannotViewMap": false,
    "cannotMoveDirectly": false,
    "images": [],
    "item_ratio": 1,
    "underGround": false,
    "defaultGround": "ground",
    "bgm": null,
    "upFloor": null,
    "downFloor": null,
    "color": null,
    "weather": null,
    "firstArrive": [],
    "eachArrive": [],
    "parallelDo": "",
    "events": {},
    "changeFloor": {},
    "afterBattle": {},
    "afterGetItem": {},
    "afterOpenDoor": {},
    "autoEvent": {},
    "cannotMove": {}
}

class map extends jsFile {
    constructor(mapid, data) {
        super(`./project/floors/${mapid}.js`, data, `main.floors.${mapid}=\n`, {
            stringifier: function(data) {
                const tempJsonObj = Object.assign({}, data);
                const tempMap = ['map', 'bgmap','fgmap'].map(key => {
                    const value = [key, createGuid(), tempJsonObj[key]];
                    tempJsonObj[key] = value[1];
                    return value;
                });
                let tempJson = JSON.stringify(tempJsonObj, ftools.replacerForSaving, 4);
                tempMap.forEach(function (v) {
                    tempJson = tempJson.replace(`"${v[1]}"`, `[\n${ftools.formatMap(v[2], v[0] != 'map')}\n]`)
                });
                return tempJson;
            }
        });
        this.addEmitter('afterSave', function(h, str) {
            //editor.addUsedFlags(str);
        });
    }
}

export default new class gameRuntime {

    /** 游戏数据 */
    data = {};
    /** 
     * 生命周期钩子, 均为Promise
     */
    hooks = {};
    __resolves__ = {} // 生命周期钩子的resolve函数存放在此

    maps = {};

    /////// 初始化方法 ////////

    constructor() {
        this.iframe = document.createElement("iframe");
        this.iframe.style.display = "none";
        document.body.appendChild(this.iframe);
        this.runtime = this.iframe.contentWindow;
        this.document = this.iframe.document;
        this.createHooks([
            'iframeLoad', 'dataLoad', 'libLoad', 'floorsLoad', 'imagesLoad', 'initOver'
        ]);
        this.load();

        // 设置钩子对应事件
        this.hooks.dataLoad.then(function() {
            this.wrapData();
            this.mapList = this.main.floorIds;
        }.bind(this))

        this.hooks.floorsLoad.then(function() {
            this.wrapMaps();
        }.bind(this))
    }

    load() {
        const res = this.__resolves__;
        this.iframe.onload = function() {
            this.runtime._editor__setHooks__(res);
            this.main = this.runtime.main;
            this.main.init('editor', function () {
                this.core = this.runtime.core;
                res.initOver();
            }.bind(this));
            res.iframeLoad(this);
        }.bind(this)
        this.iframe.src = "./editor_runtime.html";
    }

    createHooks(hooks) {
        const resolves = this.__resolves__;
        for (let h of hooks) {
            this.hooks[h] = new Promise((res, rej) => {
                resolves[h] = () => { console.log("======"+h+"======"); res() };
            });
        }
    }

    wrapData() {
        const normalFormat = function(data) {
            return JSON.stringify(data, ftools.replacerForSaving, '\t');
        }
        const listFormat = function(data) {
            // 只用\t展开第一层
            let emap = {};
            let estr = JSON.stringify(data, function (_k, v) {
                if (v.id != null) {
                    const id_ = createGuid();
                    emap[id_] = JSON.stringify(v, ftools.replacerForSaving);
                    return id_;
                } else return v
            }, '\t');
            for (let id_ in emap) {
                estr = estr.replace('"' + id_ + '"', emap[id_]);
            }
            return estr;
        }
        for (let n in project) {
            const name = n+project[n];
            this.data[n] = new jsFile(`./project/${n}.js`, this.runtime[name], `var ${name} = \n`, {
                stringifier: ['maps', 'enemys'].some(e => e === n) ? listFormat : normalFormat,
            });
        }
    }

    wrapMaps() {
        let maps = this.main.floors;
        for (let m in maps) {
            this.maps[m] = new map(m, Object.assign({}, defaultMap, maps[m]));
        }
    }

    buildMapTree(mapStruct) {
        const decodeMapStruct = function(arr, attach) {
            let output = [], record = {};
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] instanceof Array) {
                    let { output: o, record: r } = decodeMapStruct(arr[i], attach);
                    output[output.length-1].children = o;
                    record = Object.assign({}, record, r);
                } else {
                    output.push({ mapid: arr[i], map: attach[arr[i]] });
                    record[arr[i]] = true;
                }
            }
            return { output, record };
        }

        let { output, record } = decodeMapStruct(mapStruct, this.maps);
        for (let mapid of this.mapList) {
            if (!record[mapid]) {
                output.push({ mapid, map: this.maps[mapid] });
            }
        }
        this.mapTree = output;
    }

    apply(func, ...rest) {
        return this.core[func].apply(this.core, rest);
    }

    //////// 获取游戏信息的方法 ////////

    /** 获取工程名称 */
    getProjectName() {
        return this.data.data.access("firstData.title");
    }

    /** 
     * 获取地图列表
     * @returns {Array<String>}
     */
    getMapList() {
        return this.mapList;
    }

    /** 获取地图文件列表 */ 
    async getMapFileList() {
        return new Promise((res, rej) => {
            editor.fs.readdir('project/floors', function(err, data) {
                if (err) rej(err);
                else res(data);
            });
        })
    }

    /** 
     * 获取游戏地图
     */
    getMaps() {
        return this.maps;
    }

    /** 获取当前地图 */
    fetchMap() {
        var mapArray = core.maps.saveMap(core.status.floorId);
        editor.map = mapArray.map(function (v) {
            return v.map(function (v) {
                var x = parseInt(v), y = editor.indexs[x];
                if (y == null) {
                    printe("素材数字" + x + "未定义。是不是忘了注册，或者接档时没有覆盖icons.js和maps.js？");
                    y = [0];
                }
                return editor.ids[y[0]]
            })
        });
        editor.currentFloorId = core.status.floorId;
        editor.currentFloorData = core.floors[core.status.floorId];
        // 补出缺省的数据
        editor.currentFloorData.autoEvent = editor.currentFloorData.autoEvent || {};
        //
        for (var ii = 0, name; name = ['bgmap', 'fgmap'][ii]; ii++) {
            var mapArray = editor.currentFloorData[name];
            if (!mapArray || JSON.stringify(mapArray) == JSON.stringify([])) {//未设置或空数组
                //与editor.map同形的全0
                mapArray = eval('[' + Array(editor.map.length + 1).join('[' + Array(editor.map[0].length + 1).join('0,') + '],') + ']');
            }
            editor[name] = mapArray.map(function (v) {
                return v.map(function (v) {
                    var x = parseInt(v), y = editor.indexs[x];
                    if (y == null) {
                        printe("素材数字" + x + "未定义。是不是忘了注册，或者接档时没有覆盖icons.js和maps.js？");
                        y = [0];
                    }
                    return editor.ids[y[0]]
                })
            });
        }
    }

    idsInit(maps, icons) {
        editor.ids = [0];
        editor.indexs = [];
        var MAX_NUM = 0;
        var keys = Object.keys(maps_90f36752_8815_4be8_b32b_d7fad1d0542e);
        for (var ii = 0; ii < keys.length; ii++) {
            var v = ~~keys[ii];
            if (v > MAX_NUM && v < core.icons.tilesetStartOffset) MAX_NUM = v;
        }
        editor.MAX_NUM = MAX_NUM;
        var getInfoById = function (id) {
            var block = maps.initBlock(0, 0, id);
            if (Object.prototype.hasOwnProperty.call(block, 'event')) {
                return block;
            }
        }
        var point = 0;
        for (var i = 0; i <= MAX_NUM; i++) {
            var indexBlock = getInfoById(i);
            editor.indexs[i] = [];
            if (indexBlock) {
                var id = indexBlock.event.id;
                var indexId = indexBlock.id;
                var allCls = Object.keys(icons);
                if (i == 17) {
                    editor.ids.push({ 'idnum': 17, 'id': id, 'images': 'terrains' });
                    point++;
                    editor.indexs[i].push(point);
                    continue;
                }
                for (var j = 0; j < allCls.length; j++) {
                    if (id in icons[allCls[j]]) {
                        editor.ids.push({ 'idnum': indexId, 'id': id, 'images': allCls[j], 'y': icons[allCls[j]][id] });
                        point++;
                        editor.indexs[i].push(point);
                    }
                }
            }
        }
        editor.indexs[0] = [0];

        var startOffset = core.icons.tilesetStartOffset;
        for (var i in core.tilesets) {
            var imgName = core.tilesets[i];
            var img = core.material.images.tilesets[imgName];
            var width = Math.floor(img.width / 32), height = Math.floor(img.height / 32);
            if (img.width % 32 || img.height % 32) {
                // alert(imgName + '的长或宽不是32的整数倍, 请修改后刷新页面');
                console.warn(imgName + '的长或宽不是32的整数倍, 请修改后刷新页面');
            }
            if (img.width * img.height > 32 * 32 * 3000) {
                // alert(imgName + '上的图块数量超过了3000，请修改后刷新页面');
                console.warn(imgName + '上的图块数量超过了3000，请修改后刷新页面');
            }
            for (var id = startOffset; id < startOffset + width * height; id++) {
                var x = (id - startOffset) % width, y = parseInt((id - startOffset) / width);
                var indexBlock = getInfoById(id);
                editor.ids.push({ 'idnum': id, 'id': indexBlock.event.id, 'images': imgName, "x": x, "y": y, isTile: true });
                point++;
                editor.indexs[id] = [point];
            }
            startOffset += core.icons.tilesetStartOffset;
        }
    }

    getResourceFolders() {
        return [
            { label: "动画", path: "animates", type: "animate", suffix: ".animate" },
            { label: "元件", path: "tiles", type: "image", src: h => h.main.materials, opt: "append", suffix: ".png" },
            { label: "元件组", path: "tilesets", type: "image" },
            { label: "自动元件", path: "autotiles", modify: this.updateAutotiles, type: "image", suffix: ".png" },
            { label: "图片", path: "images", type: "image" },
            { label: "音乐", path: "bgms", type: "music" },
            { label: "音效", path: "sounds", type: "music" },
            { label: "系统图片", path: "system", type: "image", src: h => h.main.systemMaterials, opt: "const", suffix: ".png" },
        ]
    }

    getResourceList(folder) {
        let registered = [];
        if (folder.src) {
            registered = folder.src(this);
        } else {
            registered = this.data.data.access(`[main][${folder.path}]`);
        }
        console.log(this.main);
        if (folder.suffix) registered = registered.map(e => e + folder.suffix)
        return registered;
    }


    /** 获取资源列表 */
    async readResourceDir(folder) {
        return await new Promise((res, rej) => {
            fs.readdir('./project/'+folder.path, (err, data) => {
                if (err) rej(err);
                else res(data);
            })
        });
    }

    updateAutotiles() {

    }

    registerBlock() {

    }
}
