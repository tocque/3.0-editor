import { isset } from "./utils.js"

export default class Router {

    subrouters = []

    onServe = false

    rules = {
        GET: [],
        DO: [],
        POST: [],
        UPDATE: [],
        FETCH: []
    }

    emitter = {}

    constructor(setup) {
        if (setup != undefined) {
            if (setup instanceof Function) {
                setup.apply(this);
            } else {
                (setup.subrouters || []).forEach(([pattern, router]) => {
                    this.registerSubrouter(pattern, router);
                });
                (setup.rules || []).forEach(([method, pattern, action]) => {
                    this.registerRule(method, pattern, action);
                });
                (setup.on || []).forEach(([event, action]) => {
                    this.on(event, action);
                });
            }
        }
    }

    service() { // 启动服务
        this.onServe = true;
    }

    on(event, action) {
        if (!this.emitter[event]) this.emitter[event] = [];
        this.emitter[event].push(action);
    }

    emit(event) {
        if (this.emitter[event]) {
            this.emitter[event].forEach((e) => e());
        }
        this.subrouters.forEach(e => e.emit(event));
    }

    request(method, url, params) {
        for (let subrouter of this.subrouters) {
            const res = this.match(subrouter.pattern, url);
            if (!isset(res)) continue;
            return subrouter.request(method, res, params);
        }
        for (let rule of this.rules[method]) {
            const res = this.match(rule.pattern, url);
            if (!isset(res)) continue;
            return rule.action(res, params);
        }
        throw new Error(`没有对应的响应规则 method: [${method}] url: [${url}]`);
    }

    match(pattern, url) {
        if (typeof pattern == "string") {
            return url.startsWith(pattern) ? url.substring(pattern.length) : null;
        } else if (pattern instanceof Function) {
            return pattern(url);
        }
    }

    registerSubrouter(pattern, router) {
        router.pattern = pattern
        this.subrouters.push(router)
    }

    registerRule(method, pattern, action) {
        this.rules[method].push({ pattern, action });
    }
}