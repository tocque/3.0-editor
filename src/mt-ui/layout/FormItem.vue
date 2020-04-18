<template>
    <div class="mt-form-item">
        <label 
            class="mt-form-item__label" :style="{ width: labelWidth+'px' }"
        >{{ label }}</label>
        <div class="mt-form-item__content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "mt-form-item",
    props: {
        "label": String,
        "labelWidth": { default: 80 }
    },
}
</script>

<style lang="less">
.mt-form-item {
    display: flex;
    align-items: baseline;
    &__content {
        padding: 10px;
    }
}
</style>