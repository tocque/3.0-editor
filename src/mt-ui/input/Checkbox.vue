<template>
    <div class="mt-checkbox" :class="{ 'checked': this.checked }" @click="toggle">
        <mt-icon 
            :icon="indeterminate ? 'dash' : 'check'" 
            :size="14" v-show="this.checked"
        ></mt-icon>
    </div>
</template>

<script>
export default {
    name: "mt-checkbox",
    props: {
        "checked": { default: false, type: Boolean },
        "indeterminate": { default: false, type: Boolean }
    },
    model: {
        prop: "checked",
        event: "change"
    },
    methods: {
        toggle() {
            this.$emit("change", !this.checked, { target: { checked: !this.checked } });
        }
    }
}
</script>

<style lang="less">
.mt-checkbox {
    width: 14px;
    height: 14px;
    margin: 2px;
    display: flex;
    border: var(--c-text) solid 1px;
    color: var(--c-text-hl);
    &.checked {
        background: var(--c-link);
    }
}
</style>