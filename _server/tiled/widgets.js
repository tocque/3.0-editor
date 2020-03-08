/**
 * @file tiled/widgets.js 编辑的小配件类
 */

export const markedContainer = {
    template: /* HTML */`
    <div class="markedContainer">
        <ul class="colMark">
            <li v-for="i of size[0]" :class="{ active: mousePos[0] == i-1 }">{{ i-1 }}</li>
        </ul>
        <ul class="rowMark">
            <li v-for="i of size[1]" :class="{ active: mousePos[1] == i-1 }">{{ i-1 }}</li>
        </ul>
        <div @mousemove="setMark" class="__inner">
            <slot></slot>
        </div>
    </div>
    `,
    props: ["size"],
    data() {
        return {
            mousePos: [-1, -1],
        }
    },
    methods: {
        /**
         * 设置鼠标对应的标尺
         * @param {MouseEvent} e 
         */
        setMark(e) {
            return;
            this.$set(this.mousePos, 0, Math.floor(e.layerX/32));
            this.$set(this.mousePos, 1, Math.floor(e.layerY/32));
        }
    }
}