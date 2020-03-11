/**
 * @file tiled/widgets.js 编辑的小配件类
 */

export const markedContainer = {
    template: /* HTML */`
    <div class="markedContainer">
        <div class="anchor"></div>
        <ul class="colMark" :style="{ left: left+'px' }">
            <li v-for="i of size[0]" :class="{ active: mousePos[0] == i-1 }">{{ i-1 }}</li>
        </ul>
        <ul class="rowMark" :style="{ top: top+'px' }">
            <li v-for="i of size[1]" :class="{ active: mousePos[1] == i-1 }">{{ i-1 }}</li>
        </ul>
        <div @mousemove="activeMark" @scroll="setMark" class="__inner">
            <slot></slot>
        </div>
    </div>
    `,
    props: ["size"],
    data() {
        return {
            mousePos: [-1, -1],
            left: 20,
            top: 20
        }
    },
    create() {
        this.scrollTime = 0;
    },
    methods: {
        /**
         * 设置鼠标对应的标尺格
         * @param {MouseEvent} e 
         */
        activeMark(e) {
            return;
            this.$set(this.mousePos, 0, Math.floor(e.layerX/32));
            this.$set(this.mousePos, 1, Math.floor(e.layerY/32));
        },
        /**
         * 滚动标尺
         * @param {Event} e 
         */
        setMark(e) {
            if (e.timeStamp - this.scrollTime < 30) return;
            this.left = 20 - e.target.scrollLeft;
            this.top = 20 - e.target.scrollTop;
            return;
        }
    }
}