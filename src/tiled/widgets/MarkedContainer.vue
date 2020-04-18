<template>
    <div class="markedContainer">
        <div class="anchor"></div>
        <ul class="colMark" :style="{ left: left+'px' }">
            <li v-for="i of size[0]" :key="i"
                :class="{ active: mousePos[0] == i-1 }"
            >{{ i-1 }}</li>
        </ul>
        <ul class="rowMark" :style="{ top: top+'px' }">
            <li v-for="i of size[1]" :key="i"
                :class="{ active: mousePos[1] == i-1 }"
            >{{ i-1 }}</li>
        </ul>
        <div @mousemove="activeMark" @scroll="setMark" class="__inner">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
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
            // this.$set(this.mousePos, 0, Math.floor(e.layerX/32));
            // this.$set(this.mousePos, 1, Math.floor(e.layerY/32));
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
</script>

<style lang="less">
.markedContainer {
    &.expend {
        bottom: 35px;
    }
    .anchor {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        background: #0E0E0E;
        z-index: 10;
    }
    .colMark, .rowMark {
        position: absolute;
        display: flex;
        font-size: 14px;
        color: #999999;
        font-family: Consolas, "Courier New", monospace;
        font-feature-settings: "liga" 0, "calt" 0;
        li {       
            display: flex;
            justify-content: center;
            align-items: center;
            &.active {
                color: #FFFFFF;
            }
        }
    }
    .colMark {
        top: 5px;
        left: 20px;
        flex-direction: row;
        li {
            width: 31px;
            height: 10px;
            border-left: 1px #BBBBBB solid;
            &:last-child {
                border-right: 1px #BBBBBB solid;
            }
        }
    }
    .rowMark {
        top: 20px;
        left: 5px;
        flex-direction: column;
        li {
            width: 10px;
            height: 31px;
            border-top: 1px #BBBBBB solid;
            &:last-child {
                border-bottom: 1px #BBBBBB solid;
            }
        }
    }
    .__inner {
        position: absolute;
        top: 20px;
        left: 20px;
        right: 0;
        bottom: 0;
        overflow: auto;
    }
}
</style>