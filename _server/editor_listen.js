/**
 * editor_listen.js 监听事件的类
 */
export var listen = new class editor_listen {
    /**
     * 获取事件冒泡路径
     */
    getPath = function (e) {
        return e.path || e.composedPath; // 兼容写法
    }

    /**
     * 判断事件是否经过特定元素
     * @param {Event} e 事件
     * @param {Function} judge 判断函数
     * @returns {HTMLElement} 符合条件的元素, 没有则返回null
     */
    hasPass = function (e, judge) {
        for (let elm of listen.getPath(e)) {
            if (judge(elm)) return elm;
        }
        return null;
    }

    /**
     * 设置事件代理
     * @param {HTMLElement} e 要绑定的事件元素
     * @param {String} e 事件类型
     * @param {Function} judge 判断函数
     * @param {Function} action 触发的事件
     */
    proxyEvent = function (target, type, judge, action) {
        target.addEventListener(type, function(e) {
            let elm = listen.hasPass(e, judge);
            if (elm) action(elm, e);
        });
    }
};
