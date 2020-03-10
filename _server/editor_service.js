export default new class serviceManager {
    services = {};
    hasReceived = {};

    _service = class service {

        $host

        constructor(config) {
            Object.assign(this, config.data);
            for (let m in config.methods) {
                this[m] = config.methods[m].bind(this);
            }
            if (config.mount) this.$mount = config.mount.bind(this);
        }
    }

    register(mountTo, config) {
        if (!(mountTo in this.services)) this.services[mountTo] = [];
        var service = new this._service(config);
        this.services[mountTo].push(service);
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


    /**面板主要编辑器的方法 */
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
                    event: {}
                }, config);
                this.sys_mainEditor__.modes[name] = config;
            },
            $changeMode(newMode) {
                let me = this.sys_mainEditor__;
                if (me.modes[newMode].__props__.task) {
                    me.taskStack.push(me.modeStack);
                }
                editor.util.exec(me.modes[mode].unactive);
                editor.util.exec(me.modes[newMode].active);
                this.$emit("onmode", { editor: this, newMode });
                me.mode = newMode;
            },
            /**
             * @param {String} name 主编辑器名称
             * @param {String} mode 初始状态名称
             */
            $work(name, mode) {
                let me = this.sys_mainEditor__;
                this.$changeMode.finish = () => {
                    this.$changeMode(me.modeStack.pop());
                };
                me.name = name;
                editor.service.receive(this, name);
                if (mode.task) console.warn("初始状态不能是task");
                editor.util.exec(me.modes[mode].active);
                this.$emit("onmode", { editor: this, mode });
                me.mode = mode;
            },
            $trigger(type, event) {
                let me = this.sys_mainEditor__;
                editor.util.exec(me.modes[me.mode].event[type], event);
            }
        }
    }
    
}
