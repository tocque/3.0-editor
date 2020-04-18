<template functional>
    <div class="mt-progress-bit">
        <div></div>
    </div>
</template>

<script>
export default {
    name: "mt-progress-bit"
}
</script>

<style lang="less">
@keyframes progress-bit {
	0% {
        left: 0%;
        width: 2%;
	}
	25% {
		left: 20%;
        width: 6%;
	}
	50% {
		left: 50%;
        width: 8%;
	}
	75% {
		left: 80%;
        width: 6%;
	}
	100% {
		left: 100%;
        width: 2%;
	}
}

.mt-progress-bit {
    position: relative;
    width: 100%;
    height: 2px;
    div {
        background: #0e70c0;
        position: absolute;
        height: 2px;
        animation: progress-bit 1.5s linear infinite;
    }
}
</style>