<template>
    <mt-side-pane pane="blockData" icon="map" label="图块属性">
        <template #header v-show="info.id">
            <div class="icon-btn" title="复制"><mt-icon icon="files"></mt-icon></div>
            <div class="icon-btn" title="粘贴"><mt-icon icon="clippy"></mt-icon></div>
        </template>
        <form-tree v-show="info.id && info.type == 'item'" ref="itemTable" 
            commentsrc="data/items/comment" @changeNode.native="onchange"
        ></form-tree>
        <form-tree v-show="info.id && info.type == 'enemy'" ref="enemyTable" 
            commentsrc="data/enemys/comment" @changeNode.native="onchange"
        ></form-tree>
        <form-tree v-show="info.id && info.type == 'mapblock'" ref="mapblockTable" 
            commentsrc="data/maps/comment" @changeNode.native="onchange"
        ></form-tree>
        <div class='newIdIdnum' v-show="info.type && !info.id"><!-- id and idnum -->
            <input placeholder="新id（唯一标识符）"/>
            <input placeholder="新idnum（10000以内数字）"/>
            <button>save</button>
            <br/>
            <button style="margin-top: 10px">自动注册</button>
        </div>
    </mt-side-pane>
</template>

<script>
import { isset } from "../../utils.js";
import game from "../../game.js";

export default {
    data() {
        return {
            info: { type: null, id: null, index: null },
        }
    },
    methods: {
        /**
         * @param {Block} block 
         */
        update(block) {
            this.info.type = block.type;
            this.info.id = block.id;
            this.info.index = block.index;
            if (!block.id) {
                return;
            }
            let data;
            if (["enemys", "enemy48"].includes(block.cls)) {
                data = game.get("data/enemys/query", block.id);
                this.info.type = "enemy";
            } else if (["items"].includes(block.cls)) {
                data = game.get("data/items/query", block.id);
                this.info.type = "item";
            } else {
                data = game.get("data/maps/query", block.number);
                this.info.type = "mapblock";
            }
            // this.pos.set(pos);
            // const posInfo = game.map.getPosInfo(pos, this.getCurrentMap());
            this.$refs[this.info.type+'Table'].update(data);
        },
        onchange({ detail: { field, value } }) {
            const { type, id, number } = this.info;
            switch(type) {
                case "enemy": 
                    game.update(`data/enemys/file`, id, { field, value });
                    break;
                case "item": 
                    game.update(`data/items/file`, id, { field, value });
                    break;
                case "mapblock": 
                    game.update(`data/maps/file`, number, { field, value });
                    break;
            }
        }
    },
}
</script>

<style>

</style>
