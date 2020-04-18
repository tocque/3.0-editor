<template>
    <div @click="$emit('change', !checked)" role="switch"
        class="mt-switch" :class="{ on: checked }"
    >
        <em>{{ checked ? 'T' : 'F' }}</em>
        <i></i>
    </div>
</template>

<script>
export default {
    name: "mt-switch",
    props: {
        checked: Boolean
    },
    model: {
        prop: 'checked',
        event: 'change'
    },
}
</script>

<style lang="less">
.mt-switch {
    position: relative;
    display: inline-block;
    vertical-align: middle;
    height: 18px;
    min-width: 32px;
    padding: 0 5px;
    border: 1px solid #d2d2d2;
    border-radius: 4px;
    cursor: pointer;
    background-color: #555;
    -webkit-transition: .1s linear;
    transition: .1s linear;
    >i {
        position: absolute;
        left: 2px;
        top: 1px;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background-color: #d2d2d2;
        -webkit-transition: .1s linear;
        transition: .1s linear;
    }
    >em {
        position: relative;
        top: -2px;
        width: 25px;
        margin-left: 21px;
        padding: 0;
        text-align: center;
        color: #999;
        font-style: normal;
    }
    &.on {
        background-color: #0e5483;
        >i {
            left: 100%;
            margin-left: -17px;
        }
        >em {
            margin-left: 3px;
            color: #ccc;
        }
    }
}
</style>