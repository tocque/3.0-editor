import { Pos, exec } from "../editor_util.js";
import listen from "../editor_listen.js"

let __currentContextMenu__ = null;

document.body.addEventListener("click", function(e) {
    if (__currentContextMenu__ && 
        !listen.getEventPath(e).includes(__currentContextMenu__.$el)) {
        __currentContextMenu__.close();
    }
});

Vue.component('contextMenu', {
    template: /* HTML */`
    <div class="contextmenu" v-if="active" :style="{left: pos.x + 'px', top: pos.y + 'px'}">
        <ul>
            <li
                v-for="(item, index) of menuitems" :key="index"
                :class="{'disable': item.vaildate}"
                @click="execAction(item)"
            >{{ item.text }}</li>
        </ul>
    </div>
    `,
    props: ["bindTo", "addinParam"],
    data: function() {
        return {
            active: false,
            pos: new Pos(),
            items: []
        }
    },
    created() {
        this.itemcnt = 0;
        this.event = null;
        this.addin = null;
    },
    mounted() {
        this.bindElm = document.querySelector(this.bindTo) || this.$parent.$el;
        this.bindElm.addEventListener("contextmenu", this.open.bind(this));
    },
    computed: {
        menuitems() {
            const args = [this.event, this.$parent, this.addin];
            return this.items.filter((item) => exec(item.condition, ...args) ?? true)
                .map((item) => ({
                    text: exec(item.text, ...args) ?? item.text,
                    vaildate: exec(item.vaildate, ...args) ?? true,
                    action: item.action,
                }));
        }
    },
    methods: {
        /**
         * @param {MouseEvent} e 
         */
        open: function(e) {
            if (__currentContextMenu__) {
                __currentContextMenu__.close();
            }
            __currentContextMenu__ = this;
            this.pos.set(e.clientX, e.clientY);
            this.event = e;
            this.addin = this.addinParam(e, this.pos);
            this.$emit("beforeOpen", e);
            this.active = true;
            e.preventDefault();
        },
        close: function() {
            __currentContextMenu__ = null;
            this.active = false;
        },
        inject: function(item, props) {
            if (item instanceof Array) {
                for (let _item of item) {
                    this.inject(Object.assign({}, props, _item));
                }
            } else {
                item.id = this.itemcnt;
                this.items.push(item);
            }
        },
        execAction(item) {
            if (item.vaildate) item.action(event, this.$parent, this.addin);
        }
    }
})