let libURL = "https://h5mota.com/plugins/getList.php";

export default {
    template: /* HTML */`
    <mt-side-pane pane="pluginLib" icon="extensions" label="插件库">
        <mt-search placeholder="搜索插件"></mt-search>
        <div class="container">
            <mt-list :items="pluginList" @chose="chose">
                <template #item="{ item }">
                    <h5>{{ item.name }}</h5>
                    <p>{{ item.abstract }}</p>
                    <span>{{ item.author }}</span>
                </template>
            </mt-list>
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
        chose(info, index) {
            this.$emit("openTab", {
                type: "plugin",
                info,
                id: index,
                icon: "plug",
                label: "扩展: "+info.name,
            });
        },
    }
}