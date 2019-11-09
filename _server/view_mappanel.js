/**
 * view_mappanel.js 地图编辑界面表现层
 */
import {utils} from "./editor_util.js";
import * as ui from "./editor_ui.js";
import * as view from "./editor_view.js";
import { listen } from "./editor_listen.js";

class sidebar extends ui.navbar {

    collapse = false; // 初始默认不折叠

    constructor(body, tabelms, slides, chosen) {
        super(body, tabelms, chosen);
        this.slides = slides;
        // this.collapse = (chosen == ""); // 若chosen为空则初始折叠
    }

    switch(elm) {
        let tab = elm.dataset.tab;
        if (tab == this.chosen) {
            this.toggle();
        } else {
            if (this.chosen) {
                this.unchose(this.chosen);
            }
            this.chose(tab);
            this.toggle(false);
        }
    }

    toggle(code) {
        if (utils.isset(code)) {
            if (code == this.collapse) return;
            if (code) {
                for (let elm of this.slides) {
                    elm.classList.add("collapse");
                }
            } else {
                for (let elm of this.slides) {
                    elm.classList.remove("collapse");
                }
            }
            this.collapse = code;
        } else {
            this.toggle(!this.collapse);
        }
    }
}

class mapExplorer extends view.editor {

    name = "mapExplorer";

    constructor(body) {
        super(body);
        
        listen.proxyEvent(this.body, "click", (elm) => {
            return elm instanceof HTMLLIElement;
        }, this.click.bind(this));
        // this.mapTree = new mapTree(this.body.getElementById("mapExplorerUL"), {
        //      editorable: true,
        // });
        // this.search = new inputBar(
        //     document.getElementById("mapExplorerUL"), 
        //     this.filter.bind(this), 
        //     true
        // );
        // this.menu = new contextMenu(this.body, {
    
        // });
        this.list = {};
        this.chosen = null;
    }
    
    filter(keyword) {
        keyword = keyword || "";
        for (let li of this.list) {
            let text = this.getText(li._value);
            if (text.indexOf(keyword) != -1) {
                li.innerHTML = this.highlightKeyword(text, keyword);
                this.showLi(li);
            } else {
                this.hideLi(li);
            }
        }
    }
    
    getText(value) {
        return this.data[value];
    }
    
    showLi(li) {
        li.style.display = "block";
    }
    
    hideLi(li) {
        li.style.display = "none";
    }
    
    delete(id) {
        this.list.splice(id, 1);
        this.body.removeChild(this.list[id]);
    }
    
    chose(li) {
        if (editor.util.isset(this.chosen)) {
            this.chosen.classList.remove("chosen");
        }
        li.classList.add("chosen");
        editor.mapPanel.changeMap(li._value);
        this.chosen = li;
    }
    
    click(elm, e) {
        this.chose(elm);
    }

    initList() {
        for (let i = 0; i < editor.map.floorIds.length; i++) {
            this.insertFloor(editor.map.floorIds[i]);
        }
        //this.chosen = this.list[core.status.floorId];
        // editor.changeFloor(core.status.floorId);
    }
    
    insertFloor(name, target) {
        var li = document.createElement("li");
        li._value = name;
        li.innerHTML = `<i class="codicon codicon-symbol-file"></i>
        <span>${name}</span>`;
        this.list[name] = li;
        if (target) {
            if (target instanceof HTMLLIElement) target.insertBefore(li);
        } else {
            this.body.appendChild(li);
        }
    }
    
    highlightKeyword(text, keyword) {
        return text.replace(keyword,"<span class=\"keyword\">"+keyword+"</span>")
    }

}

export var mapPanel = new class mapPanel extends view.panel {

    /**
     * 地图编辑面板
     */
    constructor() {
        super(document.getElementById("mapPanel"), "map");
        // 初始化面板本身的dom
        let side = document.getElementById("mapSide");
        this.sidebar = new sidebar(side, side.getElementsByTagName("li"), [
            document.getElementById("mapLeft"), 
            document.getElementById("mapMid"),
        ], "mapExplorer");
        
        this.mapInfo = view.infobar.applyBlock('panel');
        //this.locInfo = infobar.applyBlock('panel');
        // 初始化地图数据模块

        // 初始化各个表现层模块
        const mapLeft = {
            "mapExplorer": new mapExplorer(document.getElementById("mapExplorer")),
        }
        for (let i in mapLeft) {
            this[i] = mapLeft[i];
            mapLeft[i].bindTo(this.sidebar);
        }
        
        // this.mapEvent = new list(document.getElementById("mapEventList"));
        // this.mapProperty = new list(document.getElementById("mapPropertyList"));
    }

    changeMap(mapId) {
        editor.map.changeFloor(mapId);
        this.mapInfo.setContent = editor.map.currentFloorData.title;
        this.mapProperty.update();
    }
}

class tileEditor {

    constructor() {
        this.paintInfo = infoBar.applyBlock('editor');
        this.airwallImg = new Image();
        this.airwallImg.src = './_server/img/airwall.png';
    }
    
    loc(callback) {
        //editor.pos={x: 0, y: 0};
        if (!editor.util.isset(editor.pos)) return;
        editor.mapPanel.locInfo.setContent(editor.map.pos.x + ',' + editor.map.pos.y);

        editor.mapPanel.mapEvent.update();
        if (Boolean(callback)) callback();
    }
    
    loadMap() {
    
    } 
    
    active() {
        paintInfo.show();
    }
    
    unactive() {
        paintInfo.hide();
    }
    
    updateBlockInfo() {
        if(value!=null) {
            var val=value
            var oldval=tip._infos
    
            tip.isClearBlock(false);
            tip.isAirwall(false);
            if (typeof(val) != 'undefined') {
                if (val == 0) {
                    tip.isClearBlock(true);
                    return;
                }
                if ('id' in val) {
                    if (val.idnum == 17) {
                        tip.isAirwall(true);
                        return;
                    }
                    tip.hasId = true;
                } else {
                    tip.hasId = false;
                }
                tip.isAutotile = false;
                if (val.images == "autotile" && tip.hasId) tip.isAutotile = true;
                document.getElementById('isAirwall-else').innerHTML=(tip.hasId?`<p>图块编号：<span class="infoText">${ value['idnum'] }</span></p>
                <p>图块ID：<span class="infoText">${ value['id'] }</span></p>`:`
                <p class="warnText">该图块无对应的数字或ID存在，请先前往icons.js和maps.js中进行定义！</p>`)+`
                <p>图块所在素材：<span class="infoText">${ value['images'] + (tip.isAutotile ? '( '+value['id']+' )' : '') }</span>
                </p>
                <p>图块索引：<span class="infoText">${ value['y'] }</span></p>`
            }
    
            tip._infos=value
        }
        return tip._infos
    
    }
    
    selectIcon() {
        
    }

}
