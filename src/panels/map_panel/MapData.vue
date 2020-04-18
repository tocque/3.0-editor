<template>
    <mt-side-pane pane="mapData" icon="list-unordered" label="楼层属性">
        <form-tree ref="floorTable" comment="floor" 
            @changeNode.native="onchange" commentsrc="map/comment"
        ></form-tree>
    </mt-side-pane>
</template>

<script>
import game from "../../game.js";
import { isset } from '../../utils.js';

export default {
    computed: Vuex.mapState("map", {
        currentMapid: 'currentMapid',
    }),
    data() {
        return {
            data: null,
        }
    },
    created() {

    },
    methods: {
        update() {
            if (!isset(this.currentMapid)) return;
            const mapData = game.get(`map/${this.currentMapid}/file`);
            this.$refs.floorTable.update(mapData);
        },
        async onchange({ detail: { field, value } }) {
            await game.update(`map/${this.currentMapid}/file`, { key: field, value })
        }
    },
    watch: {
        currentMapid() {
            this.update();
        }
    },
}
</script>

<style>

</style>