<template>
    <div class="plugin-detail">
        <h3>{{ info.name }}</h3>
        <span>{{ info.author }}</span>
        <p>{{ info.abstract }}</p>
    </div>
</template>

<script>
const libURL = "https://h5mota.com/plugins/getList.php";

export default {
    props: ["info"],
    data() {
        return {
        }
    },
    methods: {
        
    }
}
</script>

<style>
.plugin-detail {
    position: absolute;
    width: 100%;
    height: 100%;
    background: var(--c-main);
    color: var(--c-text);
}
</style>