import { clone } from "./utils.js"

export default class Log {

    constructor(src, defaultConfig = {}) {
        this.src = src;
        this.loaded = fetch(src).then(data => data.json())
            .then((data) => {
                this.config = data;
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
    
    set(key, value, save = true) {
        this.config[key] = clone(value);
        if (save) return this.save();
    }
    
    async save() {
        try {
            await server.fs.write(this.src,  JSON.stringify(this.config, null, 4) , 'utf-8')
        } catch (e) {
            window.parent.onerror(`写入配置文件${this.src}失败, 错误信息: ${e}`, "config.js");
        }
        return this;
    }
}