export const MtBtn = {
    name: "mt-btn",
    functional: true,
    render(h, ctx) {
        ctx.class = [ctx.data.staticClass, "mt-btn"];
        if (ctx.props.mini != null) ctx.class.push("__mini");
        ctx.on = ctx.listeners;
        return h('button', ctx, ctx.children);
    },
}

export const MtSwitch = {
    name: "mt-switch",
    template: /* HTML */`
    <div @click="$emit('toggle', !checked)" 
        class="mt-switch" :class="{ on: checked }"
    >
        <em>{{ checked ? 'T' : 'F' }}</em>
        <i></i>
    </div>`,
    model: {
        prop: 'checked',
        event: 'toggle'
    },
    props: {
        checked: Boolean
    },
};

export const MtSearch = {
    name: "mt-search",
    inheritAttrs: false,
    template: /* HTML */`
        <div class="mt-search">
            <input class="mt-input" type="text" v-model="value" v-bind="$attrs"
                @change="onChange" @keydown.enter="e => onChange(e, true)"
            />
            <div @click="clear" class="clearBtn" :class="{ disabled: value == '' }">
                <i class="codicon codicon-clear-all"></i>
            </div>
        </div>
    `,
    props: ["immediate"],
    data() {
        return {
            value: '',
        }
    },
    methods: {
        clear() {
            this.value = '';
            this.$emit('change', '');
        },
        onChange(e, force) {
            if (this.immediate || force) this.$emit("change", this.value);
        },
    }
};