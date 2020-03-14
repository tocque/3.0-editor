/**
 * @file editor_ui.js ui使用的函数, 主要为dom操作函数
 */ 

export const uivalues = {};

/** 引入CSS @param {String} url */
export const importCSS = function(url) {
    const css = document.createElement('link');
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = url;
    document.head.appendChild(css);
}

/** 挂载CSS字串 @param {String} CSSText */
export const mountCSS = function(CSSText) {
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.appendChild(document.createTextNode(CSSText));
    document.head.appendChild(style);
}

export const getScrollBarHeight = function() {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

    document.body.appendChild(outer);

    let widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    let inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    let widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
}

uivalues.scrollBarHeight = getScrollBarHeight();

export const insertSortElm = function(parent, elm) {
    for (let node of parent.children) {
        if (node.priority < elm.priority) {
            parent.insertBefore(elm, node);
            return;
        }
    }
    parent.appendChild(elm);
}
