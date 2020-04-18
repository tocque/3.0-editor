import Router from "./router.js";
import { clone, createGuid } from "./utils.js"

/** @param {String} path */
const resolvePath = function(path) {
    if (!path) return [];
    return path.startsWith('[') 
        ? path.slice(1, -1).split('][')
        : path.split(".");
}

const replaceByPool = function(datastr, pool) {
    for (let guid in pool) {
        datastr = datastr.replace(`"${guid}"`, pool[guid]);
    }
    return datastr;
}

/** 只展开第一层 */
const listFormatter = function(data) {
    const emap = {};
    let estr = JSON.stringify(data, function (_k, v) {
        if (v.id != null) {
            const id_ = createGuid();
            emap[id_] = JSON.stringify(v);
            return id_;
        } else return v
    }, '\t');
    return replaceByPool(estr, emap);
}

export class JsonData {

    /**
     * json文件的类
     * @param name 文件名称
     * @param stringifier 格式化
     */
    constructor(name, stringifier = (str => JSON.stringify(str, null, '\t'))) {
        this.name = name;
        this.src = `./project/${name}.json`;
        this.stringifier = stringifier;
    }

    load() {
        this.data = main.gameData[this.name];
    }

    emmiter = {};

    /**
     * 访问数据域
     * @param {string} path 路径
     */
    query(path) {
        return resolvePath(path).reduce((e, key) => e[key], this.data);
    }

    queue = [];

    /**
     * 修改
     */
    modify(commands) {
        if (!(Array.isArray(commands))) commands = [commands];
        for (let { key, value } of commands) {   
            const path = resolvePath(key);
            const name = path.pop();
            const data = path.reduce((p, e) => p[e], this.data);
            console.log(data);
            data[name] = clone(value);
        }
        if (this.queue.length > 0) {
            return new Promise((res, rej) => {
                this.queue.push([res, rej]);
            })
        } else return this.save();
    }
 
    /**
     * 设置触发器, 目前提供[beforeSave] [afterSave], 传入this作为参数
     */
    addEmitter(type, action) {
        if (!this.emmiter[type]) this.emmiter[type] = [];
        this.emmiter[type].push(action);
    }

    emit(event, ...rest) {
        if (Array.isArray(this.emmiter[event])) {
            this.emmiter[event].forEach(e => e(...rest));
        }
    }

    save(queuep = 0) {
        this.emit('beforeSave', this);
        const datastr = this.stringifier(this.data);
        return new Promise((res, rej) => {
            server.fs.write(this.src, core.encodeBase64(datastr), 'base64').then((err) => {
                if (err) {
                    if (queuep) {
                        while(queuep--) this.queue.shift()[1](err);
                    } else rej(err);
                }
                else {
                    this.emit('afterSave', this, datastr);
                    if (queuep) {
                        while(queuep--) this.queue.shift()[0](this.data);
                    } else res(this.data);
                }
                if (this.queue.length > 0) {
                    this.save(this.queue.length);
                }
            });
        });
    }
}

class JsData {

    pool = {}

    /**
     * javascript文件的类, 仅存储函数对象
     * @param {String} name 文件名称
     * @param {String} guid 文件数据
     */
    constructor(name, guid) {
        this.src = "./project/"+name+".js";
        this.guid = guid;
        this.name = name;
        this.prefix = `var ${name}_${guid} = \n`;
    }

    load() {
        this.data = window[this.name+"_"+this.guid];
        this.refer = this.buildPool(this.data, this.pool);
    }

    buildPool(data, pool) {
        if (data instanceof Function) {
            const guid = createGuid();
            pool[guid] = data.toString();
            return guid;
        }
        const refer = {};
        for (let key in data) {
            refer[key] = this.buildPool(data[key], pool);
        }
        return refer;
    }

    emmiter = {};

    /**
     * 访问数据域
     * @param {String} path 路径
     * @param {"refer"|"content"} refer
     */
    query(path = "", type = "refer") {
        const refer = resolvePath(path).reduce((e, key) => e[key], this.refer);
        if (type == "refer") {
            return refer;
        }
        return this.stringifier(refer);
    }

    queue = [];

    /**
     * 
     * @param {{key: String, value}|Array<{key: String, value}>} commands 
     * @returns {Promise}
     */
    modify(commands) {
        if (!(Array.isArray(commands))) commands = [commands];
        for (let command of commands) {
            const route = resolvePath(command.key);
            let data = this.data, refer = this.refer;
            for (let i = 0; i < route.length-1; i++) {
                data = data[route[i]];
                refer = refer[route[i]];
            }
            const key = route[route.length-1];
            console.log(key, refer, command.value);
            this.pool[refer[key]] = command.value;
            //data[key] = eval(command.value);
            console.log(eval(command.value));
        }
        if (this.queue.length > 0) {
            return new Promise((res, rej) => {
                this.queue.push[res, rej];
            })
        } else return this.save();
    }
 
    /**
     * 设置触发器, 目前提供[beforeSave] [afterSave], 传入this作为参数
     * @param {String} type 
     * @param {Function} action 
     */
    addEmitter(type, action) {
        if (!this.emmiter[type]) this.emmiter[type] = [];
        this.emmiter[type].push(action);
    }

    emit(event, ...rest) {
        if (Array.isArray(this.emmiter[event])) {
            this.emmiter[event].forEach(e => e(...rest));
        }
    }

    stringifier(refer) {
        if (typeof refer == "string") return this.pool[refer];
        const copy = {};
        for (let key in refer) {
            copy[key] = this.stringifier(refer[key]);
        }
        return copy;
    }

    save(queuep = 0) {
        this.emit('beforeSave', this);
        const datastr = this.prefix + replaceByPool(
            JSON.stringify(this.refer, null, 4), this.pool
        )
        return new Promise((res, rej) => {
            server.fs.write(this.src, datastr, 'utf-8').then((err) => {
                if (err) {
                    if (queuep) {
                        while(queuep--) this.queue.shift()[1](err);
                    } else rej(err);
                }
                else {
                    this.emit('afterSave', this, datastr);
                    if (queuep) {
                        while(queuep--) this.queue.shift()[0](this.data);
                    } else res(this.data);
                }
                if (this.queue.length > 0) {
                    this.save(this.queue.length);
                }
            });
        });
    }
}

class DataBase extends Router {
    constructor(name, file, setup) {
        super(setup);
        this.name = name;
        this.file = file;
        this.registerRule("GET", "file", (url, [path, type]) => {
            return this.file.query(path, type);
        })
        this.registerRule("UPDATE", "file", (url, [commands]) => {
            return this.file.modify(commands);
        })
        this.on("dataLoad", () => {
            this.file.load();
        })
    }
}

const $data = new DataBase(
    "data", 
    new JsonData("data"),
    {
        rules: [ 
            ["GET", "projectName", () => main.gameData.data.firstData.title ],
            ["GET", "comments/", (url) => {
                return server.comments["data"]._data[url];
            }]
        ]
    }
);

const $maps = new DataBase(
    "maps", 
    new JsonData("maps", listFormatter),
    {
        rules: [ 
            ["GET", "col", (url, [id]) => {
                main.gameData.data.firstData.title 
            }],
            ["GET", "comment", () => server.comments.block ]
        ]
    }
);

const $items = new DataBase(
    "items", 
    new JsonData("items", listFormatter),
    {
        rules: [ 
            ["GET", "projectName", () => main.gameData.data.firstData.title ],
            ["GET", "comment", () => server.comments.item ]
        ]
    }
);

const $enemys = new DataBase(
    "enemys", 
    new JsonData("enemys", listFormatter),
    {
        rules: [ 
            ["GET", "projectName", () => main.gameData.data.firstData.title ],
            ["GET", "comment", () => server.comments.enemy ]
        ]
    }
);

const $events = new DataBase(
    "events", 
    new JsonData("events"),
    {
        rules: [
            ["GET", "commonevents", (url, [key]) => {
                if (key) return $events.file.query(`[commonEvent][${key}]`)
                else return $events.file.query("[commonEvent]")
            }],
            ["UPDATE", "commonevents", (url, [commands]) => {
                if (!Array.isArray(commands)) commands = [commands];
                return $events.file.modify(commands.map((command) => {
                    command.key = "[commonEvent]" + command.key;
                    return command;
                }));
            }]
        ]
    }
);

const $functions = new DataBase(
    "functions", 
    new JsData("functions", "d6ad677b_427a_4623_b50f_a445a3b0ef8a"), {
        rules: [
            ["GET", "comment", () => {
                return server.comments["functions"];
            }]
        ]
    }
);

const dataRouter = new Router({
    subrouters: [
        [ "data/", $data ],
        [ "maps/", $maps ],
        [ "items/", $items ],
        [ "enemys/", $enemys ],
        [ "events/", $events ],
        [ "functions/", $functions ]
    ]
})

export default dataRouter;