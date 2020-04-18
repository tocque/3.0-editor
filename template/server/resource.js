import Router from "./router.js";

class ResourceBase extends Router {

    constructor(name, label, suffix) {
        super();
        this.suffix = this.suffix || suffix;
        this.src = `./project/${name}/`;
        this.name = name;
        this.label = label;
        this.on("imagesLoad", () => {
            this.service();
        })
        this.registerRule("FETCH", "dir", () => {
            return this.readdir();
        })
        this.registerRule("FETCH", "tree", async () => {
            return this.diffTree(await this.readdir(), this.registry);
        })
        this.registerRule("GET", "reg", () => {
            return main.gameData.data.main[this.name];
        })
        this.registerRule("POST", "reg", (url, [name]) => {
            return this.registerFile(name);
        })
        this.registerRule("POST", "unreg", (url, [name]) => {
            return this.unregisterFile(name);
        })
    }

    get registry() {
        return main.gameData.data.main[this.name];
    }

    async readdir() {
        const fileList = await server.fs.readdir(this.src);
        return fileList.filter((e) => {
            if (Array.isArray(e)) return true;
            return this.checkSuffix(e);
        })
    }

    /**
     * @param {string[]} fileList
     * @param {string[] | {[key: string]: string[]}} registered
     * @returns { fileTree: string[], missing: Set }
     */
    diffTree(fileList, registered) {
        if (!Array.isArray(this.suffix)) {
            registered = registered.map(e => e + this.suffix)
        }
        const missing = new Set(registered);
        const checked = []
        const fileTree = fileList.map((e) => {
            const file = { name: e, path: e, icon: this.icon }
            if (missing.has(e)) {
                checked.push(e);
                missing.delete(e);
            }
            return file;
        })
        return { fileTree, checked, missing: [...missing] }
    }

    checkSuffix(e) {
        e = e.split('.');
        e = '.'+e[e.length-1];
        if (Array.isArray(this.suffix)) return this.suffix.includes(e);
        else return e == this.suffix;
    }

    async registerFile(name) {
        if (!Array.isArray(this.suffix)) name = name.slice(0, -this.suffix.length);
        if (this.registry.includes(name)) return;
        return server.request("UPDATE", "data/data/file", [{
            key: `[main][${this.name}]`, value: this.registry.concat([name])
        }])
    }

    async unregisterFile(name) {
        if (!Array.isArray(this.suffix)) name = name.slice(0, -this.suffix.length);
        if (!this.registry.includes(name)) return;
        return server.request("UPDATE", "data/data/file", [{
            key: `[main][${this.name}]`, value: this.registry.filter(e => e != name)
        }])
    }
}

class AudioResourceBase extends ResourceBase {

    suffix = [".mp3", ".ogg"]
    icon = "unmute"
    type = "audio"
}

class AnimateResourceBase extends ResourceBase {

    suffix = ".animate"
    icon = "flame"
    type = "animate"
}

class TileResourceBase extends ResourceBase {

    suffix = ".png"
    icon = "file-media"
    type = "image"
}

class SpriteResourceBase extends ResourceBase {

    suffix = ".png"
    icon = "file-media"
    type = "image"

    /**
     * @param {string} path
     * @returns {Promise<fileTree>}  
     */
    async readdir(path = "") {
        const fileList = await server.fs.readdir(this.src+path);
        const task = fileList.map(async (e) => {
            if (server.fs.isDir(this.src+path+e)) {
                return [e, ...(await this.readdir(path+e+"/"))];
            }
            return e;
        })
        return (await Promise.all(task)).filter((e) => {
            if (Array.isArray(e)) return true;
            return this.checkSuffix(e);
        })
    }

    /**
     * @typedef {Array<{ 
     *     name: string, 
     *     path: string, 
     *     icon: string,
     *     children?: fileTree 
     * }} fileTree
     * 
     * @param {Array<string, string[]>} fileList
     * @param {{[key: string]: string[]} | string[]} registered
     * @returns {{ fileTree: fileTree, checked: string[], missing: string[] }}
     */
    diffTree(fileList, registered, path = "") {
        console.log(fileList, registered);
        let missing, defaultMissing;
        const leaf = Array.isArray(registered);
        const checked = [];
        if (leaf) {
            if (!Array.isArray(this.suffix)) {
                registered = registered.map(e => e + this.suffix)
            }
            missing = new Set(registered);
        } else {
            missing = [];
            defaultMissing = new Set((registered.default||[]).map(e => e + this.suffix));
        }
        const fileTree = fileList.map((e) => {
            if (Array.isArray(e)) {
                const [name, ...rest] = e;
                const { 
                    fileTree: subTree,
                    checked: subChecked,
                    missing: subMissing
                } = this.diffTree(rest, (registered[name] || {}), path+name+"/");
                missing.push(...subMissing);
                if (subChecked.length > 0) {
                    checked.push(path+name, ...subChecked);
                }
                return { name, path: path+name, icon: "folder", children: subTree }
            } else {
                if (leaf) {
                    if (missing.has(e)) {
                        checked.push(path+e);
                        missing.delete(e);
                    }
                } else {
                    if (defaultMissing.has(e)) {
                        checked.push(path+e);
                        defaultMissing.delete(e);
                    }
                }
                return { name: e, path: path+e, icon: this.icon };
            }
        })
        if (leaf) {
            missing = [...missing];
        } else {
            missing.push(...defaultMissing);
        }
        return { fileTree, checked, missing }
    }

    async registerFile(path) {
        if (server.fs.isDir(this.src+path)) {
            let subTree = await this.readdir(path+'/');
            const field = path.split('/');
            const fieldstr = field.length > 0 ? `[${field.join('][')}]` : "";
            const registry = field.reduce((p, e) => p[e], this.registry);
            let subRegisty = [];
            if (Array.isArray(registry)) {
                if (!Array.isArray(this.suffix)) {
                    subTree = subTree.map(e => e.slice(0, -this.suffix.length));
                }
                subRegisty = subTree;
            } else {
                // /** @param {fileTree} subTree */
                // const createSubRegisty = (subTree) => {
                //     return subTree.reduce((subRegisty, node) => {
                //         if (Array.isArray(node)) {
                //             const [name, ...subTree] = node;
                //             subRegisty[name] = createSubRegisty(subTree);
                //         } else {
                //             if (!subRegisty.default) subRegisty.default = [];
                //             subRegisty.default.push(node);
                //         }
                //         return subRegisty;
                //     }, {})
                // }
                // subRegisty = createSubRegisty(subTree);
            }
            return server.request("UPDATE", "data/data/file", [{
                key: `[main][${this.name}]`+fieldstr, value: subRegisty
            }])
        }
        if (!Array.isArray(this.suffix)) path = path.slice(0, -this.suffix.length);
        const field = path.split('/');
        const name = field.pop();
        let registry = field.reduce((p, e) => p[e], this.registry);
        if (!Array.isArray(registry)) {
            if (!registry.default) registry.default = [];
            registry = registry.default;
            field.push("default");
        }
        if (registry.includes(name)) return;
        const fieldstr = field.length > 0 ? `[${field.join('][')}]` : "";
        return server.request("UPDATE", "data/data/file", [{
            key: `[main][${this.name}]`+fieldstr, value: registry.concat([name])
        }])
    }

    async unregisterFile(path) {
        if (server.fs.isDir(this.src+path)) {
            const field = path.split('/');
            const fieldstr = field.length > 0 ? `[${field.join('][')}]` : "";
            const registry = field.reduce((p, e) => p[e], this.registry);
            return server.request("UPDATE", "data/data/file", [{
                key: `[main][${this.name}]`+fieldstr, value: Array.isArray(registry) ? [] : {}
            }])
        }
        if (!Array.isArray(this.suffix)) path = path.slice(0, -this.suffix.length);
        const field = path.split('/');
        const name = field.pop();
        let registry = field.reduce((p, e) => p[e], this.registry);
        if (!Array.isArray(registry)) {
            if (!registry.default) registry.default = [];
            registry = registry.default;
            field.push("default");
        }
        if (!registry.includes(name)) return;
        const fieldstr = field.length > 0 ? `[${field.join('][')}]` : "";
        return server.request("UPDATE", "data/data/file", [{
            key: `[main][${this.name}]`+fieldstr, value: registry.filter(e => e != name)
        }])
    }
}

class ImageResourceBase extends ResourceBase {

    suffix = [".png", ".jpg", ".gif"]
    icon = "file-media"
    type = "image"
}

const resourceBases = {
    "bgms": new AudioResourceBase("bgms", "bgm"), 
    "sounds": new AudioResourceBase("sounds", "se"),
    "animates": new AnimateResourceBase("animates", "动画"), 
    "tilesets": new TileResourceBase("tilesets", "元件组"), 
    "autotiles": new TileResourceBase("autotiles", "自动元件"), 
    "enemys": new SpriteResourceBase("enemys", "怪物"), 
    "items": new SpriteResourceBase("items", "物品"),
    "events": new SpriteResourceBase("events", "事件"), 
    "images": new ImageResourceBase("images", "图片"), 
};

const resourceRouter = new Router();

resourceRouter.registerRule("GET","typeList", () => {
    return Object.values(resourceBases)
        .map(({ name, label, type }) => ({ name, label, type }));
})

for (let i in resourceBases) {
    resourceRouter.registerSubrouter(i+'/', resourceBases[i]);
}

export default resourceRouter