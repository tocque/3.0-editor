/**
 * @file editor_file.js 文件操作的中间层
 */
import { createGuid, clone, accessField, encode64 } from "./editor_util.js";

/**是否警告过压缩 */
let alertedCompress = false;

const checkCompress = function() {
    if (editor.game.main._useCompress && !alertedCompress) {
        editor.window.$notify.warn("当前游戏使用的是压缩文件,修改完成后请使用 启动服务.exe->Js代码压缩工具重新压缩,或者把main.js的useCompress改成false来使用原始文件", {
            time: 12000,
            source: `文件编辑: ${this.src}`
        });
    }
}

let replacerRecord = {}

const fileIcons = {
    "png": "file-media",
    "jpg": "file-media",
    "mp3": "ummte",
}

export const ftools = {
    functionProcess(data, pool) {
        return JSON.parse(JSON.stringify(data, (_key, value) => {
            if (typeof(value) === 'function') {
                const guid = createGuid();
                pool[guid] = value.toString();
                return guid;
            } else return value;
        }));
    },
    fixByPool(data, pool) {
        for (let guid in pool) {
            data = data.replace(`"${guid}"`, pool[guid]);
        }
        return data;
    },
    formatMap(mapArr, trySimplify) {
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
    },
    /** @param {String} filename */
    getIcon(filename) {
        const suffix = filename.split(".")[1];
        return fileIcons[suffix] || "file";
    }
}

export class Config {
    
    constructor(src, defaultConfig = {}) {
        this.src = src;
        return fs.fetch(src).then(data => {
                this.config = JSON.parse(data);
                return this;
            }).catch(err => {
                console.warn(`无法读取配置文件(${src}), 已重新生成, 错误信息 ${err}`);
                this.config = defaultConfig;
                return this.save();
            });
    }
    
    get(key, defaultValue) {
        const value = clone(this.config[key]);
        return value ?? defaultValue;
    }
    
    set(key, value, save) {
        this.config[key] = clone(value);
        if (save !== false) return this.save();
    }
    
    save() {
        return new Promise((res, rej) => {
            fs.writeFile(this.src, JSON.stringify(this.config, null, 4) ,'utf-8', (e) => {
                if (e) editor.window.$notify(`写入配置文件${src}失败, 错误信息: ${e}`, {
                    time: 5000,
                });
                else res();
            })
        })
    }
}

export class JsFile {

    /**
     * javascript文件的类
     * @param {String} url 文件相对地址
     * @param {Object} data 文件数据
     * @param {String} prefix 文件前缀
     * @param {{stringifier: Function}} config 文件配置
     */
    constructor(url, data, prefix, config = {}) {
        this.src = url;
        this.functionPool = {};
        this.data = ftools.functionProcess(data, this.functionPool);
        this.prefix = prefix;
        this.stringifier = config.stringifier || JSON.stringify; // 字符串化函数
    }

    emmiter = {};

    /**
     * 访问数据域
     * @param {String} 路径
     */
    access(route) {
        let data = accessField(this.data, route);
        if (typeof data === 'string' && this.functionPool[data]) {
            data = this.functionPool[data];
        }
        return data;
    }

    modify(commands) {
        if (!(commands instanceof Array)) commands = [commands];
        for (let command of commands) {
            const route = command.key.slice(1, -1).split('][');
            let data = this.data;
            for (let i = 0; i < route.length-1; i++) {
                data = data[route[i]];
            }
            const key = route[route.length-1];
            const value = clone(command.value);
            if (typeof data[key] === 'string' && this.functionPool[data[key]]) {
                this.functionPool[data[key]] = value;
            } else data[key] = value;
        }
        return this.save();
    }
 
    /**
     * 设置触发器, 目前提供[beforeSave] [afterSave], 传入this作为参数
     * @param {String} type 
     * @param {Function} action 
     */
    addEmitter(type, action) {
        if (!this.emmiter[type]) this.emmiter[type] = [];
        this.emmiter[type].push(action);
    };

    emit(event, ...rest) {
        if (this.emmiter[event] instanceof Array) {
            this.emmiter[event].forEach(e => e(...rest));
        }
    }

    save() {
        this.emit('beforeSave', this);
        const datastr = this.prefix + ftools.fixByPool(this.stringifier(this.data), this.functionPool);
        return new Promise((res, rej) => {
            fs.writeFile(this.src, encode64(datastr), 'base64', (err, data) => {
                if (err) rej(err);
                else {
                    this.emit('afterSave', this, datastr);
                    checkCompress();
                    res(data);
                }
            });
        });
    }
}
