<template>
    <div class="mt-window" v-show="active" :style="outerStyle" role="dialog">
        <div class="mt-window__title">
            <slot name="title">
                <h5>{{ title }}</h5>
            </slot>
            <div v-if="closeBtn != null" @click="close" class="mt-window__control">
                <mt-icon class="icon-btn" icon="chrome-close"></mt-icon>
            </div>
        </div>
        <div class="mt-window__content">
            <slot></slot>
        </div>
        <div class="mt-window__mask" ref="mask" v-if="mask != null" v-show="active"></div>
        <div class="mt-window__foot" v-if="$slots.foot">
            <slot name="foot"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "mt-window",
    props: ["closeBtn", "active", "mask", "title", "width"],
    computed: {
        outerStyle() {
            if (!this.width) return;
            if (!this.width.endsWith("%")) return;
            const i = (100 - parseInt(this.width.slice(0, -1))) / 2;
            return { left: i+'%', right: i+'%' };
        }
    },
    mounted() {
        if (this.mask != null) document.body.appendChild(this.$refs.mask);
        document.body.appendChild(this.$el);
    },
    methods: {
        close() {
            this.$emit("close")
            this.$emit("update:active", false)
        }
    }
}
</script>

<style lang="less">
.mt-window {
    position: absolute;
    background: var(--c-bg-pop);
    z-index: 30;
    box-shadow: 0 0 3px 3px var(--c-shadow);
    height: fit-content;
    &__title {
        display: flex;
        h5 {
            padding: 5px;
        }
    }
    &__control {
        margin-left: auto;
    }
    &__foot {
        display: flex;
        justify-content: flex-end;
        padding: 5x;
        .mt-btn {
            margin-right: 20px;
        }
    }
    &__mask {
        height: 100%;
        width: 100%;
        position: fixed;
        top: 0;
        z-index: 20;
        background: rgba(0,0,0,0.1);
    }
}
</style>