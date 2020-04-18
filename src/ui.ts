/**
 * @file ui.js ui使用的函数, 主要为dom操作函数
 */ 

/** 引入CSS */
export const importCSS = function(url: string) {
    const css = document.createElement('link');
    css.rel = "stylesheet";
    css.type = "text/css";
    css.href = url;
    document.head.appendChild(css);
}

/** 挂载CSS字串 */
export const mountCSS = function(CSSText: string) {
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

    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    // remove divs
    outer.parentNode.removeChild(outer);

    return outer.offsetWidth - inner.offsetWidth;
}

export const uivalues: {
    scrollBarHeight: number
} = {
    scrollBarHeight: getScrollBarHeight()
};
