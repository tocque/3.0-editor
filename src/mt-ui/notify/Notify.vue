<template>
    <div class="toast-notify">
        <div class="notify-body">
            <div class="codicon" :class="'codicon-'+config.type"></div>
            <div class="content">{{ config.content }}</div>
            <div class="codicon codicon-close" @click="close"></div>
        </div>
        <div class="notify-bottom" v-if="source || buttons.length">
            <div class="source" v-if="source">来自: {{ source }}</div>
            <ul class="buttonGroup" v-if="buttons.length">
                <li v-for="(button, index) of buttons" :key="index">
                    <mt-btn @click="close(button.action)">{{ button.text }}</mt-btn>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    props: ["config", "source", "buttons", "onclose"],
    created() {
        if (this.config.time > 0) {
            const timer = setTimeout(() => { 
                this.close();
                window.clearTimeout(timer);
            }, this.config.time);
        }
    },
    methods: {
        close() {
            if (this.onclose) this.onclose();
            this.$parent.$parent.close(this.config.guid);
        },
    }
}
</script>

<style lang="less">
.toast-notify {
    max-width: 480px;
    margin: 8px;
    background-color: var(--c-bg-pop);
    box-shadow: 0 0 8px #000000;
    &:hover {
        background-color: var(--c-bg-pop-hl);
    }
    .notify-body {
        display: flex;
        padding: 15px 12px;
        .content {
            color: var(--c-text);
            padding: 0 5px;
        }
        .codicon {
            font-size: 24px;
        }
        .codicon-info {
            color: #74BCFC;
        }
        .codicon-warning {
            color: #FFEE22;
        }
        .codicon-error {
            color: #F48771;
        }
        .codicon-close {
            color: var(--c-text);
        }
    }
    .notify-bottom {
        padding: 5px 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .source {
            color: var(--c-text);
            font-size: 14px;
            padding-left: 10px;
        }
        .buttonGroup {
            display: flex;
        }
    }
}
</style>