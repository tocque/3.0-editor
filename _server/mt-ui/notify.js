import { createGuid } from "../editor_util.js";

Vue.use(function() {
    // 创建vue组件实例
    var notify = Vue.extend({
        template: /* HTML */`
        <div class="toast-notify">
            <div class="notify-body">
                <div class="codicon" :class="'codicon-'+config.type"></div>
                <div class="content">{{ config.content }}</div>
                <div class="codicon codicon-close" @click="close"></div>
            </div>
            <div class="notify-bottom" v-if="source || buttons.length">
                <div class="source" v-if="source">来自: {{ source }}</div>
                <ul class="buttonGroup" v-if="buttons.length">
                    <li v-for="(button, index) of buttons" :key="index">
                        <mt-btn @click="close(button.action)">{{ button.text }}</mt-btn>
                    </li>
                </ul>
            </div>
        </div>
        `,
        props: ["config", "source", "buttons", "onclose"],
        created: function() {
            if (this.config.time > 0) {
                const timer = setTimeout(() => { 
                    this.close();
                    window.clearTimeout(timer);
                }, this.config.time);
            }
        },
        methods: {
            close() {
                if (this.onclose) this.onclose();
                this.$parent.$parent.close(this.config);
            },
        }
    });
    
    //添加通知节点(用来存放通知的元素)
    let notifyWrap = document.createElement('div');
    let notifyToaster = new Vue({
        el: notifyWrap,
        template: /* HTML */`
        <div class="notify-wrap">
            <transition-group name="slide-fade">
                <mt-notify v-for="config of list" 
                    :key="config.guid"
                    :config="config"
                    :source="config.source"
                    :buttons="config.buttons"
                ></mt-notify>
            </transition-group>
        </div>`,
        data() {
            return {
                list: [],
            }
        },
        methods: {
            close(notify) {
                this.list = this.list.filter((n) => n != notify);
            }
        },
        components: { "mt-notify": notify },
    });
    document.body.append(notifyToaster.$el);

    let defaultConfig = {
        time: -1,
        source: null,
        buttons: [],
    }

    /**
     * 通知框
     * @content 提示内容;
     * @type 提示框类型，parameter：info，error，warning
     * @time 显示时长
     */ 
    let showNotify = function(type, content, config) {
        config = Object.assign({}, defaultConfig, config, { 
            type, content, guid: createGuid()
        });
        notifyToaster.list.push(config);
    }

    Vue.prototype.$notify = showNotify.bind(this, 'info');
    Vue.prototype.$notify.warn = showNotify.bind(this, 'warning');
    Vue.prototype.$notify.error = showNotify.bind(this, 'error');
});