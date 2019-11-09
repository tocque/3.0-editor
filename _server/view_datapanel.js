"use strict";
/**
 * view_datapanel.js 数据编辑界面
 */
import {utils} from "./editor_util.js";
import * as ui from "./editor_ui.js";
import {list} from "./ui_list.js";
import * as view from "./editor_view.js";

export var dataPanel = new class dataPanel extends view.panel {

    /**
     * 地图编辑面板
     */
    constructor() {
        super(document.getElementById("dataPanel"), "data");
        // view.infobar.applyBlock("panel");
        // 初始化各个表
        // this.firstData = new list(document.getElementById("firstDataList"));
        // this.globalValues = new list(document.getElementById("globalValuesList"));
        // this.globalFlags = new list(document.getElementById("globalFlagsList"));
    }
}
