import { exec } from "./editor_util.js"

class Service {

    /** 指向宿主环境 */$host;
    __props__ = {};

    /**
     * @callback ServiceMounted
     * @param host 服务的宿主
     * 
     * @typedef {Object} ServiceConfig
     * @property {Object} [data] 服务的数据
     * @property {ServiceMounted} [mounted] 当服务被挂载时的调用方法
     * @property {Object} [methods] 服务的方法
     * 
     * @param {ServiceConfig} config 
     */
    constructor(config) {
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

    /**
     * 注册一个服务
     * @param {String} mountTo 被注册到的
     * @param {String} serviceName 服务名称
     * @param {ServiceConfig} config 服务配置
     */
    register(mountTo, serviceName, config) {
        const service = new Service(config);
        if (!(mountTo in this.services)) this.services[mountTo] = [service];
        else this.services[mountTo].push(service);
        if (this.hasReceived[mountTo]) this.mountTo(this.hasReceived[mountTo], service);
    }

    receive(editor, name) {
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
            $registerMode(name, config) {
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
             * @param {String} name 主编辑器名称
             * @param {String} mode 初始状态名称
             */
            $work(name, mode) {
                const me = this.sys_mainEditor__;
                this.$changeMode.finish = () => {
                    this.$changeMode(me.modeStack.pop());
                };
                me.name = name;
                serviceManager.receive(this, name);
                if (mode.task) console.warn("初始状态不能是task");
                exec(me.modes[mode].active);
                this.$emit("onmode", { editor: this, mode });
                me.mode = me.modes[mode];
            },
            $trigger(type, event) {
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
    /**
     * 
     * @param {String} type 
     * @param {Function} cb 
     */
    receiveExtensions(type, cb) {
        this.hasReceiveExtensions[type] = cb;
        const [editor, imple] = type.split(".");
        const loaded = this.extensions?.[editor]?.[imple];
        Object.entries(loaded ?? {}).forEach(([name, e]) => cb(name, e));
    }
}

export default serviceManager;