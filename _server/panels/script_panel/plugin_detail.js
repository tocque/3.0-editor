let libURL = "https://h5mota.com/plugins/getList.php";

export default {
    template: /* HTML */`
    <div class="plugin-detail">
        <h3>{{ info.name }}</h3>
        <span>{{ info.author }}</span>
        <p>{{ info.abstract }}</p>
    </div>
    `,
    props: ["info"],
    data() {
        return {
        }
    },
    methods: {
        
    }
}