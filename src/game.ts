import { createServer } from "./game/server.js"
import store from "./store.js"
const path = require('path')

type hookInfo = [string, string]

const gameClient = new class GameClient {

    iframe: HTMLIFrameElement
    runtime: any
    remote: any
    src: string
    linked = false
    server: any
    /** 生命周期钩子 */ hooks: { [key: string]: Promise<any> } = {};
    /** 生命周期钩子的resolve */ __resolves__: { [key: string]: Function } = {}

    constructor() {
        this.iframe = document.createElement("iframe");
        this.iframe.style.display = "none";
        document.body.appendChild(this.iframe);
    }

    async link(src: string, onProgress: (e: string) => void) {
        const res = this.createHooks([
            ['iframeLoad', '环境加载完毕'], 
            ['dataLoad', '数据加载完毕'], 
            ['libLoad', '库加载完毕'], 
            ['floorsLoad', '地图加载完毕'], 
            ['imagesLoad', '图像加载完毕'], 
            ['initOver', '加载完毕']
        ], onProgress);
        // @ts-ignore
        this.iframe.onload = res.iframeLoad;
        this.iframe.src = path.resolve(src, "./editor_runtime.html");
        this.src = src;

        await this.hooks.iframeLoad;
        this.runtime = this.iframe.contentWindow;
        this.remote = this.runtime.server;
        await this.remote.init(src, res);

        await this.hooks.initOver;
        this.linked = true;
        this.do("start");
    }

    unlink() {
        this.iframe.onload = null;
        this.iframe.src = "about:blank"
    }

    createHooks(hooks: hookInfo[], onProgress: (e: string) => void) {
        const resolves = this.__resolves__;
        for (let [h, info] of hooks) {
            this.hooks[h] = new Promise(res => {
                resolves[h] = (...args) => {
                    console.log("======"+h+"======");
                    onProgress(h+':'+info);
                    res(...args); 
                };
            });
        }
        return resolves;
    }

    emit() {

    }

    request(method: string, url: string, params: any[]) {
        if (!this.linked) return;
        const res = this.remote.request(method, url, params);
        console.log(res);
        return this.adapt(res);
    }

    get(url: string, ...params: any[]) {
        return this.request("GET", url, params);
    }

    async fetch(url: string, ...params: any[]) {
        return this.request("FETCH", url, params);
    }

    async post(url: string, ...params: any[]) {
        return this.request("POST", url, params);
    }

    async update(url: string, ...params: any[]) {
        return this.request("UPDATE", url, params);
    }

    async do(url: string, ...params: any[]) {
        return this.request("DO", url, params);
    }

    adapt<T> (data: T): T {
        if (data == undefined || data == null) return null;
        if (typeof data != "object") {
            return data;
        }
        // array
        if (Array.isArray(data)) {
            const copy = [];
            for (var i in data) {
                copy[i] = this.adapt(data[i]);
            }
            // @ts-ignore
            return copy;
        }
        // object
        if (data.constructor.name == "Object") {
            const copy: {[key: string]: any} = {};
            for (let i in data) {
                if (data.hasOwnProperty(i))
                    copy[i] = this.adapt(data[i]);
            }
            // @ts-ignore
            return copy;
        }
        return data;
    }
} 

store.registerModule("$game", {
    namespaced: true,
    state: {
        loading: false,
        loadingState: "",
        port: "",
    },
    mutations: {
        startLoad(state) {
            state.loading = true;
        },
        finishLoad(state) {
            state.loading = false;
        },
        loading(state, newState) {
            state.loadingState = newState;
        },
        startServer(state) {
            const { server, port } = createServer(this.src);
            gameClient.server = server;
            state.port = port;
        },
        closeServer(state) {
            gameClient.server.close();
            state.port = "";
        }
    },
    getter: {
        linked() {
            return gameClient.linked;
        }
    },
    actions: {
        async serve({ commit }, dir: string) {
            commit("startLoad", "start:开始加载"),
            await gameClient.link(dir, (e) => commit("loading", e))
            commit("finishLoad");
            commit("startServer");
        },
        async stop({ commit }) {
            gameClient.unlink();
            commit("closeServer");
        }
    }
})

export default gameClient