<template>
    <div class="mt-image-previewer">
        <img :src="file" />
    </div>
</template>

<script>
export default {
    name: "mt-image-previewer",
    props: {
        "file": String
    },
    methods: {

    },
    watch: {
        file(newValue) {
            console.log(newValue);
        }
    }
}
</script>

<style lang="less">
.mt-image-previewer {
    justify-content: center;
    flex-direction: column;
    align-items: center;
    display: flex;
    img {
        width: fit-content;
        height: fit-content;
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
    }
}
</style>