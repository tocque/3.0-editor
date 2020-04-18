import { createGuid } from "../../utils.js";
import NotifyWrap from "./NotifyWrap.vue";

export default {
    install(Vue) {

        //添加通知节点(用来存放通知的元素)
        const notifyToaster = new Vue(NotifyWrap)
            .$mount(document.createElement('div'));
        document.body.append(notifyToaster.$el);
    
        const defaultConfig = {
            time: -1,
            source: null,
            buttons: [],
        }
    
        /**
         * 通知框
         * @param {"info" | "error" | "warning"} type 提示框类型
         * @param {String} content 提示内容
         * @param config 配置
         * @returns {string}
         */ 
        const showNotify = function(type, content, config) {
            const guid = createGuid();
            config = Object.assign({}, defaultConfig, config, { 
                type, content, guid
            });
            notifyToaster.list.push(config);
            return guid;
        }
    
        Vue.prototype.$notify = showNotify.bind(this, 'info');
        Vue.prototype.$notify.warn = showNotify.bind(this, 'warning');
        Vue.prototype.$notify.error = showNotify.bind(this, 'error');

        Vue.prototype.$notify.close = notifyToaster.close;
    }
}