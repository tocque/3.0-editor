let libURL = "https://h5mota.com/plugins/getList.php";

export default {
    template: /* HTML */`
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
                .catch(e => editor.window.$notify.error("无法加载插件列表, 请检查网络连接"), {
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