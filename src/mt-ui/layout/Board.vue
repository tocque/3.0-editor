<template>
    <div class="mt-board" :class="{ folded: isFold }">
        <h4 class="mt-board__title" @click="toggle()">{{ label }}</h4>
        <transition name="slide-fade">
            <ul v-show="!isFold" class="mt-board__content">
                <slot></slot>
            </ul>
        </transition>
    </div>
</template>

<script>
import { isset } from '../../utils.js';
export default {
    name: "mt-board",
    props: ["label"],
    data() {
        return {
            isFold: false
        }
    },
    methods: {
        toggle() {
            this.isFold = !this.isFold;
        },
        fold() {
            if (!this.isFold) this.isFold = true;
        },
        unfold() {
            if (this.isFold) this.isFold = false;
        }
    }
}
</script>

<style lang="less">
.mt-board {
    &__title {
        font-weight: 200;
        margin-top: 17px;
        margin-bottom: 5px;
        font-size: 1.9em;
        line-height: normal;
        user-select: none;
        cursor: pointer;
    }
}
</style>