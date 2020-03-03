document.body.addEventListener("click", function(e) {
    let menu = Vue.prototype.__currentContextMenu__;
    if (menu && editor.listen.getEventPath(e).indexOf(menu.$el) === -1) menu.close();
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
    props: ["bindTo"],
    data: function() {
        return {
            active: false,
            pos: new editor.util.pos(),
            items: [],
            event: null,
        }
    },
    mounted: function() {
        this.bindElm = document.querySelector(this.bindTo) || this.$parent.$el;
        this.bindElm.addEventListener("contextmenu", this.open.bind(this));
    },
    computed: {
        menuitems() {
            var host = this.$parent, event = this.event;
            return this.items.filter((item) => {
                if (item.condition instanceof Function) {
                    return item.condition(event, host);
                } else return true;
            }).map((item) => {
                return {
                    text: item.text instanceof Function ? item.text(event, host) : item.text,
                    vaildate: !item.vaildate || item.vaildate(),
                    action: item.action,
                }
            });
        }
    },
    methods: {
        /**
         * @param {MouseEvent} e 
         */
        open: function(e) {
            if (Vue.prototype.__currentContextMenu__) {
                Vue.prototype.__currentContextMenu__.close();
            }
            Vue.prototype.__currentContextMenu__ = this;
            this.pos.add(editor.util.get)
            this.pos.x = e.layerX, this.pos.y = e.layerY;
            console.log(this.pos);
            this.event = e;
            this.$emit("beforeOpen", e);
            this.active = true;
            e.preventDefault();
        },
        close: function() {
            Vue.prototype.__currentContextMenu__ = null;
            this.active = false;
        },
        inject: function(item, props) {
            if (item instanceof Array) {
                for (let _item of item) {
                    this.inject(Object.assign(props || {}, _item));
                }
            } else {
                this.items.push(item);
            }
        },
        execAction(item) {
            if (item.vaildate) item.action(event, this.$parent);
        }
    }
})