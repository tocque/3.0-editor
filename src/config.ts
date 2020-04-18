import { createGuid, clone, resolvePath, encode64 } from "./utils.js";
import { localfs } from "./fs.js"

export default class Config {
    
    src: string
    config: {[key: string]: any}
    loaded: Promise<Config>

    constructor(src: string, defaultConfig = {}) {
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
    
    get(key: string, defaultValue: any) {
        const value = clone(this.config[key]);
        return value ?? defaultValue;
    }
    
    set(key: string, value: any, save = true) {
        this.config[key] = clone(value);
        if (save) return this.save();
    }
    
    async save() {
        try {
            await localfs.write(this.src,  JSON.stringify(this.config, null, 4) , 'utf-8')
        } catch (e) {
            window.onerror(`写入配置文件${this.src}失败, 错误信息: ${e}`, "config.js");
        }
        return this;
    }
}