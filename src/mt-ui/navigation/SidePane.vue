<template functional>
    <div 
        :class="['mt-side-pane', props.pane]"
        v-bind="props"
        v-on="listeners"
    >
        <div class="mt-side-pane__header">
            <h4 class="mt-side-pane__title">{{ props.label }}</h4>
            <div class="mt-side-pane__headerContent">
                <slot name="header"></slot>
            </div>
        </div>
        <div class="mt-side-pane__content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "mt-side-pane",
    props: ["label", "icon", "pane"]
}
</script>

<style lang="less">
.mt-side-pane {
    background-color: var(--c-left);
    &__header {
        margin: 8px 10px;
        display: flex;
    }
    &__title {
        font-weight: inherit;
        font-size: 14px;
        color: var(--c-header);
        line-height: 36px;
        margin: 0;
        user-select: none;
    }
    &__headerContent {
        display: flex;
        align-items: center;
        margin-left: auto;
    }
    &__content {
        width: 100%;
        height: calc(100% - 52px);
    }
}
</style>