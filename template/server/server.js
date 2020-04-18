import Router from "./router.js"
import mapRouter from "./map.js"
import dataRouter from "./data.js"
import resourceRouter from "./resource.js"
import Log from "./log.js"
import { clone } from "./utils.js"

const server = new class Server extends Router {

    comments = {}

    async init(baseURL, hooks) {
        this.baseURL = baseURL;
        this.fs = new fs.afios(baseURL);
        this.setHook(hooks);
        document.createElement = document.createElement.bind(window.parent.document)
        main.init("editor").then(async () => {
            this.emit("initOver");
            hooks.initOver();
        });
        await Promise.all([
            new Log("./work.h5mota").loaded.then((log) => {
                this.userdata = log;
                this.emit("userdataLoad");
            }),
            new Promise(res => {
                this.on("libLoad", async () => {
                    await this.loadComments();
                    res();
                })
            })
        ]);
    }

    request(method, url, params) {
        params = this.adapt(params);
        console.log(method, url, params);
        return super.request(method, url, params);
    }

    adapt(data) {
        if (data == undefined || data == null) return null;
        if (typeof data != "object") {
            return data;
        }
        // array
        if (Array.isArray(data)) {
            return data.map((e) => this.adapt(e));
        }
        // object
        if (data.constructor.name == "Object") {
            const copy = {};
            for (let i in data) {
                if (data.hasOwnProperty(i))
                    copy[i] = this.adapt(data[i]);
            }
            return copy;
        }
        return data;
    }

    setHook(hook) {
        const self = this;
        const loadLibs = main.loadLibs;
        main.loadLibs = function(...args) {
            self.emit("dataLoad");
            hook.dataLoad(main.gameData);
            return loadLibs(...args);
        }
        const loadFloors = main.loadFloors // 劫持loadFloors函数
        main.loadFloors = async function(...args) {
            // core.extensions._load = (b) => b();
            const _load = core.loader._load;
            core.loader._load = function(...args) {
                return _load.call(core.loader, ...args).then(() => {
                    self.emit("imagesLoad");
                    hook.imagesLoad();
                });
            };
            core.loader.loadImage = function (dir, name) {
                try {
                    const image = new window.parent.Image();
                    return new Promise((res) => {
                        image.onload = function () {
                            res(image, name);
                        }
                        image.src = self.baseURL+'/project/'+ dir + name + "?v=" + main.version;
                    })
                }
                catch (e) {
                    window.parent.onerror(`加载图片${dir}/${name}出错`, "game.js");
                }
            };
            core._init_checkLocalForage = function () {
                core.platform.useLocalForage = false
            }
            const init = core.init
            core.init = (...args) => {
                self.emit("floorsLoad");
                hook.floorsLoad(main.floors);
                init.call(core, ...args);
            }
            self.emit("libLoad");
            hook.libLoad();
            return loadFloors.call(main, ...args);
        }
    }

    async loadComments() {
        const path = this.baseURL+"/server/comments/";
        const list = await this.fs.readdir(path);
        return Promise.all(list.map((e) => {
            const name = e.split(".")[0];
            return import(path+e).then((m) => {
                this.comments[name] = m.default;
            })
        }))
    }
}

window.server = server;

server.registerSubrouter("map/", mapRouter)
server.registerSubrouter("data/", dataRouter)
server.registerSubrouter("resource/", resourceRouter)

server.registerRule("GET", "scene", async (url, [name]) => {
    return window.scenes[name];
})

server.registerRule("DO", "core/", async (url, params) => {
    const funcname = url.split("/");
    const func = core[funcname[0]];
    if (funcname.length == 2) {
        return func[funcname[1]].apply(func, params);
    } else return func.apply(core, params);
})

server.registerRule("DO", "start", async() => {
    core.resetGame(core.firstData.hero, null, core.firstData.floorId, clone(core.initStatus.maps));
})

server.registerRule("GET", "userdata/", (url) => {
    return server.userdata.get(url);
})