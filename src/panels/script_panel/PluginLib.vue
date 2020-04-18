<template>
    <mt-side-pane pane="pluginLib" icon="extensions" label="插件库">
        <mt-search placeholder="搜索插件"></mt-search>
        <div class="container">
            <mt-tabs :tabs="pluginList" @switch="chose">
                <template #tab="{ tab }">
                    <h5>{{ tab.name }}</h5>
                    <p>{{ tab.abstract }}</p>
                    <span>{{ tab.author }}</span>
                </template>
            </mt-tabs>
        </div>
    </mt-side-pane>
</template>

<script>
const libURL = "https://h5mota.com/plugins/getList.php";

export default {
    template: /* HTML */`
    `,
    data() {
        return {
            pluginList: [],
        }
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            this.pluginList = this.pluginList.concat((await fetch(libURL)
                .then(res => res.json())
                .catch(e => this.$notify.error("无法加载插件列表, 请检查网络连接, 错误信息:"+e), {
                    source: "插件库"
                })).data);
        },
        chose(item) {
            this.$emit("openTab", {
                type: "plugin",
                info: item,
                id: item.index,
                icon: "plug",
                label: "扩展: "+item.name,
            });
        },
    }
}
</script>

<style lang="less">
.pluginLib {
    .container {
        top: 100px;
        bottom: 0;
    }
    li {
        cursor: pointer;
        padding: 8px 15px;
        color: var(--c-text);
        &:hover {
            background: #363636;
        }
        &.active {
            background: #3E3E3E;
        }
        h5 {
            font-size: 14px;
            margin-block-start: 0px;
            margin-block-end: 0px;
            font-weight: bold;
            .ver {
                color: lightgray;
                font-size: 10px;
            }
        }
        p {
            word-break: break-all;
            margin-block-start: 0px;
            margin-block-end: 0px;
            font-size: 14px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
        }
        span {
            font-size: 12px;
        }
    }
}
</style>