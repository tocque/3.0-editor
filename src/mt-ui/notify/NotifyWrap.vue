<template>
    <div class="notify-wrap">
        <transition-group name="slide-fade">
            <mt-notify v-for="config of list" 
                :key="config.guid"
                :config="config"
                :source="config.source"
                :buttons="config.buttons"
            ></mt-notify>
        </transition-group>
    </div>
</template>

<script>
import Notify from "./Notify.vue"

export default {
    data() {
        return {
            list: [],
        }
    },
    methods: {
        close(guid) {
            this.list = this.list.filter((n) => n.guid != guid);
        }
    },
    components: {
        "mt-notify": Notify
    },
}
</script>

<style lang="less">
.notify-wrap {
    z-index: 990;
    position: fixed;
    right: 0px;
    bottom: 27px;
    transition-duration: .5s;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    .slide-fade-enter-active, .slide-fade-leave-active {
        transition: all .3s ease;
    }
    .slide-fade-enter, .slide-fade-leave-to {
        transform: translateY(10px);
        opacity: 0;
    }
}
</style>