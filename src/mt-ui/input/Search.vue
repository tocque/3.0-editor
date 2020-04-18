<template>
    <div class="mt-search">
        <input class="mt-input" type="text" v-model="value" v-bind="$attrs"
            @change="onChange" @keydown.enter="onChange($event, true)"
        />
        <div @click="clear" class="clearBtn" :class="{ disabled: value == '' }">
            <i class="codicon codicon-clear-all"></i>
        </div>
    </div>
</template>

<script>
export default {
    name: "mt-search",
    inheritAttrs: false,
    props: ["immediate"],
    data() {
        return {
            value: '',
        }
    },
    methods: {
        clear() {
            this.value = '';
            this.$emit('change', '');
        },
        onChange(e, force) {
            if (this.immediate || force) this.$emit("change", this.value);
        },
    }
}
</script>

<style lang="less">
.mt-search {
    height: 30px;
    box-sizing: border-box;
    margin: 6px 16px;
    position: relative;
    >input {
        height: 20px;
        width: -webkit-fill-available;
        padding: 5px 5px;
        color: #ddd;
    }
    >.clearBtn {
        position: absolute;
        right: 4px;
        top: 3px;
    }
}
</style>