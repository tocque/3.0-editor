/**
 * data_panel.js 数据编辑界面
 */
import game from "../../editor_game.js";
import dataComment from "../../comments/data.comment.js";

let components = {

}

export default {
    label: "数据",
    template: /* HTML */`
    <div id="dataPanel">
        <mt-side-pane label="全局数据">
            <control-list 
                ref="main" @changeNode.native="onchange('main', $event)"
            ></control-list>
        </mt-side-pane>
        <mt-side-pane label="初始数据">
            <control-list 
                ref="firstData" @changeNode.native="onchange('firstData', $event)"
            ></control-list>
        </mt-side-pane>
        <mt-side-pane label="全局变量">
            <control-list 
                ref="values" @changeNode.native="onchange('values', $event)"
            ></control-list>
        </mt-side-pane>
        <mt-side-pane label="全局开关">
            <control-list 
                ref="flags" @changeNode.native="onchange('flags', $event)"
            ></control-list>
        </mt-side-pane>
    </div>
    `,
    data() {
        return {
            active: false,
        }
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    mounted() {
        this.update();
    },
    methods: {
        update() {
            const data = game.data.getTowerData();
            ["main", "firstData", "values", "flags"].forEach((e) => {
                this.$refs[e].update(data[e], dataComment._data[e])
            })
        },
        onchange(type, { detail: { field, value } }) {
            game.data.updateTowerData(`[${type}]${field}`, value);
        }
    },
    components,
}
