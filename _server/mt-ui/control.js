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
    <div @click="$emit('change', !checked)" role="switch"
        class="mt-switch" :class="{ on: checked }"
    >
        <em>{{ checked ? 'T' : 'F' }}</em>
        <i></i>
    </div>`,
    model: {
        prop: 'checked',
        event: 'change'
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

export const MtTable = {
    name: "mt-table",
    template: /* HTML */`
    <table cellspacing="0" cellpadding="0" border="0">
        <tbody v-if="Array.isArray(comment._items)">
            <tr v-for="(items, key) of value" :key="key">
                <td v-if="comment._parse == 'object'">{{ key }}</td>
                <td v-for="(item, i) of items" :key="i">{{ item }}</td>
            </tr>
        </tbody>
        <tbody v-else>
            <tr v-for="(item, key) of value" :key="key">
                <td v-if="comment._parse == 'object'">{{ key }}</td>
                <td>{{ item }}</td>
            </tr>
        </tbody>
    </table>
    `,
    props: ["comment", "value"],
    model: {
        prop: 'value',
        event: 'change'
    },
}

// export const MtTableControl = {
//     name: "mt-table-control",
//     template: /* HTML */`
//     <div>
//     </div>
//     `,
//     props: ["maxItem", "value"],
//     computed: {
//         addable() {
//             if (!this.maxItem) return;
//             return (Array.isArray(this.value) ? this.value
//                 : Object.keys(this.value)
//                 ).length < this.maxItem;
//         }
//     }
// }

export const MtFormItem = {
    name: "mt-form-item",
    template: /* HTML */`
    <div class="mt-form-item">
        <label class="__label" style="{ width: labelWidth+'px' }">{{ label }}</label>
        <div class="__content" style="{ margin-left: labelWidth+'px' }">
            <slot></slot>
        </div>
    </div>
    `,
    props: {
        "label": String,
        "labelWidth": { default: 80 }
    },
}

// export const MtTextarea = {
//     name: "mt-textarea",
//     template: /* HTML */`
//     <div contenteditable="true" class="mt-textarea"
//         v-text="value" @input="$emit('input')"
//     ></div>
//     `,
//     prop: ["value"],
//     model: {
//         prop: 'value',
//         event: 'input'
//     },
// }