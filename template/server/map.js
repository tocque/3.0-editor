import Router from "./router.js";
import { isset, clone, createGuid } from "./utils.js"
import { JsonData } from "./data.js";

const mapTree = new class MapTree {

    tree;
    nodes = {};

    init() {
        this.nodes = {};
        const mapStruct = server.userdata.get("mapStruct", [])
        const { output, record } = this.decodeMapStruct(mapStruct, this.attach.bind(this));
        for (let mapid of main.floorIds) {
            if (!record[mapid]) {
                output.push({ mapid, info: this.attach(mapid) });
            }
        }
        this.tree = output;
    }

    /**
     * 解析地图结构, 地图解构为用数组存储的树
     * @param {Array} arr 
     * @param {Function} attach 
     */
    decodeMapStruct(arr, attach) {
        let output = [], record = {};
        for (let e of arr) {
            if (Array.isArray(e)) {
                let { output: o, record: r } = this.decodeMapStruct(e, attach);
                output[output.length-1].children = o;
                record = Object.assign({}, record, r);
            } else {
                const res = attach(e);
                if (res) {
                    output.push(res);
                    record[e] = true;
                } else {
                    window.parent.onerror("地图结构描述中包含不存在的地图: " + e, "server/map.js");
                }
            }
        }
        return { output, record };
    }

    encodeMapStruct(tree) {
        if (tree.children) {
            return [
                tree.mapid,
                ...tree.children.map((e) => {
                return this.encodeMapStruct(e);
            })];
        }
        else return tree.mapid;
    }

    save() {
        const struct = this.encodeMapStruct({ children: this.tree });
        struct.shift();
        return server.userdata.set("mapStruct", struct);
    }
    
    attach(mapid) {
        if (!main.floors[mapid]) return;
        const { title } = main.floors[mapid];
        const node = { mapid, info: { title } };
        this.nodes[mapid] = node;
        return node;
    }

    get mapList() {
        return main.floorIds;
    }

    getTree() {
        return this.tree
    }

    async appendTo(mapid, to, save = true) {
        const newNode = this.attach(mapid);
        if (isset(to)) {
            if (!this.nodes[to].children) this.nodes[to].children = []
            this.nodes[to].children.push(newNode);
        } else {
            this.tree.push(newNode);
        }
        if (save) await this.save();
        return newNode;
    }
}

const formatMap = function(mapArr, trySimplify) {
    if (!mapArr || JSON.stringify(mapArr) == JSON.stringify([])) return '';
    if (trySimplify) {
        //检查是否是全0二维数组
        var jsoncheck = JSON.stringify(mapArr).replace(/\D/g, '');
        if (jsoncheck == Array(jsoncheck.length + 1).join('0')) return '';
    }
    //把二维数组格式化
    var formatArrStr = '';
    var arr = JSON.stringify(mapArr).replace(/\s+/g, '').split('],[');
    var si = mapArr.length - 1, sk = mapArr[0].length - 1;
    for (var i = 0; i <= si; i++) {
        var a = [];
        formatArrStr += '    [';
        if (i == 0 || i == si) a = arr[i].split(/\D+/).join(' ').trim().split(' ');
        else a = arr[i].split(/\D+/);
        for (var k = 0; k <= sk; k++) {
            var num = parseInt(a[k]);
            formatArrStr += Array(Math.max(4 - String(num).length, 0)).join(' ') + num + (k == sk ? '' : ',');
        }
        formatArrStr += ']' + (i == si ? '' : ',\n');
    }
    return formatArrStr;
}

class MapData extends JsonData {

    /**
     * 地图文件的类
     * @param {String} mapid
     * @memberof MapData
     */
    constructor(mapid) {
        super(mapid, 
            (data) => {
                const tempObj = Object.assign({}, data);
                const tempMap = ['map', 'bgmap','fgmap'].map((key) => {
                    const value = [key, createGuid(), tempObj[key]];
                    tempObj[key] = value[1];
                    return value;
                });
                const tempJson = JSON.stringify(tempObj, null, 4);
                return tempMap.reduce((e, [k, g, v]) => {
                    return e.replace(`"${g}"`, `[\n${formatMap(v, k != 'map')}\n]`)
                }, tempJson);
            }
        );
        this.src = `./project/floors/${mapid}.json`;
        this.addEmitter('afterSave', function(h, str) {
            // game.data.addUsedFlags(str);
        });
    }

    load() {
        this.data = main.floors[this.name];
    }

    drop() {
        return server.fs.remove(this.src);
    }
}

const $map = new class MapRouter extends Router {

    maps = {};

    request(method, url, params) {
        const [mapid, ...rest] = url.split('/');
        params.unshift(mapid);
        return super.request(method, rest.join('/'), params);
    }

    
    async createMap (map, mapid, to) {
        main.floorIds.push(mapid);
        main.floors[mapid] = map;
        this.maps[mapid] = new MapData(mapid);
        this.maps[mapid].load();
        this.maps[mapid].save();
        return mapTree.appendTo(mapid, to);
    }

    async remove(mapid) {
        main.floorIds = main.floorId.filter(e => e != mapid);
        delete main.floors[mapid];
        return this.maps[mapid].drop();
    }
};

$map.on('floorsLoad', () => {
    main.floorIds.forEach((e) => {
        $map.maps[e] = new MapData(e);
        $map.maps[e].load();
    })
})

$map.registerRule("GET", "file", (url, [mapid, key]) => {
    return $map.maps[mapid].query(key);
})

$map.registerRule("UPDATE", "file", (url, [mapid, command]) => {
    return $map.maps[mapid].modify(command);
})

const createMapByParams = function(params, root, i) {
    if (isset(i)) {
        params.mapid = eval('`'+params.mapid+'`');
        params.name = eval('`'+params.name+'`');
        params.title = eval('`'+params.mapid+'`');
    }
}

const validateMapid = function(mapid) {
    if (main.floorIds.includes(mapid)) return "与现有楼层id重复";
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(mapid)) {
        return ("楼层名 不合法！请使用字母、数字、下划线，且不能以数字开头！");
    }
}

const mapRouter = new Router({
    on: [
        [ "floorsLoad", () => mapRouter.service() ],
        [ "userdataLoad", () => {
            if (mapRouter.onServe) {
                mapTree.init()
            } else {
                mapRouter.on("floorsLoad", () => mapTree.init());
            }
        }]
    ],
    rules: [
        [ "GET", "tree", () => mapTree.getTree() ],
        [ "GET", "comment", () => server.comments.floor ],
        [ "POST", "create", async (url, [params, root]) => {
            if (params.batchCreate) {
                const task = [];
                for (let i = params.from; i < params.to; i++) {
                    task.push(createMapByParams(params, root, i));
                }
                return Promise.all(task);
            } else {
                return createMapByParams(params, root);
            }
        }],
        [ "POST", "paste", async (url, [from, to]) => {
            let suffix = 1;
            while(main.floorIds.includes(from+'_'+suffix)) {
                suffix++;
            }
            const map = clone(main.floors[from]);
            map.floorId = from+'_'+suffix;
            return await $map.createMap(map, from+'_'+suffix, to);
        }],
        [ "POST", "delete", (url, [mapid]) => {
            return $map.remove(mapid);
        }],
        [ "POST", "vaildate", (url, [mapid]) => {
            if (Array.isArray(mapid)) {
                if (mapid.length != new Set(mapid).size) {
                    return "尝试创建重复楼层";
                }
                const err = mapid.reduce((err, e) => {
                    const res = validateMapid(e);
                    if (res) err.add([e, res]);
                    return err;
                }, new Set);
                if (err.size == 0) return;
                return [...err].join(",");
            } else {
                return validateMapid(mapid);
            }
        }]
    ]
})

mapRouter.registerSubrouter((str) => {
    const [mapid] = str.split("/", 1);
    if (main.floorIds.includes(mapid)) return str;
}, $map);

export default mapRouter;