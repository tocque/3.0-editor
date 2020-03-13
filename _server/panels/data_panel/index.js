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
            <control-list ref="main"></control-list>
        </mt-side-pane>
        <mt-side-pane label="初始数据">
            <control-list ref="firstData"></control-list>
        </mt-side-pane>
        <mt-side-pane label="全局变量">
            <control-list ref="values"></control-list>
        </mt-side-pane>
        <mt-side-pane label="全局开关">
            <control-list ref="flags"></control-list>
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
            console.log(this.$refs);
            ["main", "firstData", "values", "flags"].forEach((e) => {
                this.$refs[e].update(data[e], dataComment._data[e])
            })
        }
    },
    components,
}
