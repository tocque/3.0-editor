import { exec } from "./utils.js"
import Config from "./config.js"

declare interface ServiceConfig {
    /** 服务的数据 */ data?: Object 
    /** 当服务被挂载时的调用方法*/ mounted?: (host: object) => void
    /** 服务的方法 */ methods?: {[key: string]: Function} 
}

class Service {

    /** 指向宿主环境 */$host: object;
    __props__: { mount?: Function } = {};

    /**
     * @callback 
     * @param host 服务的宿主
     * 
     * @param {ServiceConfig} config 
     */
    constructor(config: ServiceConfig) {
        Object.entries(config).forEach(([key, value]) => {
            switch(key) {
                case "methods": {
                    for (let m in value) {
                        this[m] = value[m].bind(this);
                    }
                } break;
                case "data": {
                    for (let m in value) {
                        this[m] = value[m];
                    }
                } break;
                case "mounted": {
                    this.__props__.mount = value.bind(this);
                } break;
                default: this[key] = value;
            }
        });
    }

    $mount($host) {
        this.$host = $host
        exec(this.__props__.mount, $host);
    }
}

const serviceManager =  new class ServiceManager {
    services = {};
    hasReceived = {};
    extensionInfo: Config

    async init() {
        this.extensionInfo = await new Config("./extensions.json").loaded;
        return this.loadExtensions(this.extensionInfo.get("mainEditor", {}));
    }

    /**
     * 注册一个服务
     * @param mountTo 被注册到的
     * @param serviceName 服务名称
     * @param config 服务配置
     */
    register(mountTo: string, serviceName: string, config: ServiceConfig) {
        const service = new Service(config);
        if (!(mountTo in this.services)) this.services[mountTo] = [service];
        else this.services[mountTo].push(service);
        if (this.hasReceived[mountTo]) this.mountTo(this.hasReceived[mountTo], service);
    }

    receive(editor, name: string) {
        editor.sys_services__ = {};
        if (!name || !this.services[name]) return;
        for (let service of this.services[name]) {
            this.mountTo(editor, service);
        }
        this.hasReceived[name] = editor;
    }

    mountTo(editor, service) {
        editor.sys_services__[service.name] = service;
        service.$host = editor;
        if (service.$mount) service.$mount(editor);
    }

    /** @mixin mainEditorExtension 面板主要编辑器的方法 */
    mainEditorExtension = {
        data() {
            return {
                sys_mainEditor__: {
                    mode: '',
                    name: null,
                    services: {},
                    modes: {},
                    modeStack: [],
                }
            }
        },
        methods: {
            $registerMode(name: string, config) {
                config = Object.assign({
                    name,
                    event: {}
                }, config);
                this.sys_mainEditor__.modes[name] = config;
            },
            $changeMode(newMode) {
                const me = this.sys_mainEditor__;
                if (me.mode.name == newMode) return;
                if (me.modes[newMode].task) {
                    me.taskStack.push(me.modeStack);
                }
                exec(me.mode.unactive);
                exec(me.modes[newMode].active);
                this.$emit("onmode", { editor: this, newMode });
                me.mode = me.modes[newMode];
            },
            /**
             * @param name 主编辑器名称
             * @param mode 初始状态名称
             */
            $work(name: string, mode: string) {
                const me = this.sys_mainEditor__;
                this.$changeMode.finish = () => {
                    this.$changeMode(me.modeStack.pop());
                };
                me.name = name;
                serviceManager.receive(this, name);
                if (me.modes[mode].task) console.warn("初始状态不能是task类型");
                exec(me.modes[mode].active);
                this.$emit("onmode", { editor: this, mode });
                me.mode = me.modes[mode];
            },
            $trigger(type: string, event) {
                const me = this.sys_mainEditor__;
                if (!me.name) return;
                exec(me.mode.event[type], event);
            }
        }
    }

    extensions = {}

    loadExtensions(info) {
        Object.entries(info).forEach(([editor, imples]) => {
            this.extensions[editor] = {};
            Object.entries(imples).forEach(([imple, extensions]) => {
                const dir = {}
                extensions.forEach((extension) => {
                    import(`./extensions/${editor}/${imple}.${extension}.js`).then((e) => {
                        dir[extension] = e;
                        const dirname = `${editor}.${imple}`
                        if (this.hasReceiveExtensions[dirname]) {
                            this.hasReceiveExtensions[dirname](extension, e);
                        }
                        console.log(`${dirname}: ${extension} ====> load`)
                    })
                })
                this.extensions[editor][imple] = dir;
            });
        });
    }

    hasReceiveExtensions = {};

    receiveExtensions(type: string, cb: (name: string, mod: any) => {}) {
        this.hasReceiveExtensions[type] = cb;
        const [editor, imple] = type.split(".");
        const loaded = this.extensions?.[editor]?.[imple];
        Object.entries(loaded ?? {}).forEach(([name, e]) => cb(name, e));
    }
}

export default serviceManager;