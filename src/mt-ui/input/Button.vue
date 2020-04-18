<template functional>
    <button class="mt-btn"
        :class="[
            data.staticClass, 
            { 'mt-btn__mini': props.mini != null }
        ]"
        v-bind="data.attrs"
        v-on="listeners"
    >
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "mt-btn",
}
</script>

<style lang="less">
.mt-btn {
    border: none;
    padding: 6px 12px;
    min-width: 100px;
    height: fit-content;
    cursor: pointer;
    white-space: nowrap;
    &+.mt-btn {
        margin-left: 15px;
    }
    background-color: var(--c-btn);
    color: #FFFFFF;
    &:hover {
        background-color: var(--c-btn-hv);
    }
    &__mini {
        padding: 3px 12px;
        min-width: 0;
    }
}
</style>