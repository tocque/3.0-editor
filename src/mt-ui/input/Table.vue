<script>
import { isset, clone } from "../../utils.js"
import Contextmenu from "../others/Contextmenu.vue"

const inputHook = {
    elm: document.createElement("input"),
    resolve: null,
    /** @param {MouseEvent} e */
    check(e) {
        if (this.resolve && e.target != this.elm) {
            this.resolve(this.elm.value);
            this.resolve = null;
        }
    },
    appendTo(elm, oldValue) {
        return new Promise(res => {
            elm.firstChild.textContent = "";
            inputHook.elm.value = oldValue;
            inputHook.resolve = res;
        }).then((newValue) => {
            elm.removeChild(inputHook.elm);
            elm.firstChild.textContent = newValue;
            return newValue;
        });
    }
};
inputHook.elm.type = "text";
inputHook.elm.classList.add("mt-input");

document.body.addEventListener("click", (e) => inputHook.check(e), true)
document.body.addEventListener("contextmenu", (e) => inputHook.check(e), true)

const contextmenu = new Vue(Contextmenu).$mount(document.createElement("div"))
contextmenu.inject([
    {
        text: "删除该项",
        action: (e, vm, key) => vm.deleteItem(key),
        condition: (e, vm) => !vm.comment._const
    },
    {
        text: "插入新项",
        action: (e, vm, key) => vm.insertItem(key),
        condition: (e, vm) => vm.comment._parse == "array" && !vm.comment._const
    },
])
document.body.appendChild(contextmenu.$el);

export default {
    name: "mt-table",
    props: ["comment", "value"],
    render() {
        const content = [];
        const { _parse } = this.comment;
        if (_parse == "object") {
            for (let key in this.value) {
                content.push(
                    <tr key={ key } data-key={ key }>
                        <td type="string" index="key">{ key }</td>
                        { this.createItem(this.value[key]) }
                    </tr>
                )
            }
        } else {
            for (let i = 0; i < this.value.length; i++) {
                content.push(
                    <tr key={ i } data-key={ i }>
                        { this.createItem(this.value[i]) }
                    </tr>
                )
            }
        }
        return (
            <table class="mt-table" 
                cellspacing="0" cellpadding="0" border="0"
                vOn:click={ this.editCell }
                vOn:contextmenu={ this.openMenu }
            >
                <tbody>
                    { content }
                </tbody>
            </table>
        )
    },
    model: {
        prop: 'value',
        event: 'change'
    },
    methods: {
        createItem(value) {
            const { _items } = this.comment;
            if (Array.isArray(_items)) {
                return _items.map((_item, i) => (
                    <td key={i} index={i} type={_item}>{ value[i] }</td>
                ))
            } else {
                return <td type={_items}>{ value }</td>
            }
        },
        /** @param {MouseEvent} e */
        editCell(e) {
            /** @type {HTMLElement} */const elm = e.target;
            if (elm instanceof HTMLInputElement) return;
            if (elm instanceof HTMLTableCellElement) {
                const key = elm.parentElement.dataset.key,
                    index = elm.getAttribute("index");
                // if (index == "newline") {
                //     this.insertItem();
                //     return;
                // }
                elm.appendChild(inputHook.elm);
                const oldValue = this.getValue(key, index);
                inputHook.appendTo(elm, oldValue).then((newValue) => {
                    if (newValue == oldValue) return;
                    if (index == "key") {
                        if (this.value[newValue]) {
                            this.$print("重命名失败, 已有同名项", "warn");
                            return;
                        }
                        this.$set(this.value, newValue, clone(this.value[key]));
                        this.$delete(this.value, key);
                    } else if (isset(index)) {
                        this.$set(this.value[key], index, newValue);
                    } else {
                        this.$set(this.value, key, newValue);
                    }
                    this.$emit("change", this.value);
                })
            }
            e.stopPropagation();
        },
        getValue(key, index) {
            if (index == "key") {
                return key
            } else if (isset(index)) {
                return this.value[key][index];
            } else { 
                return this.value[key]
            }
        },
        /** @param {MouseEvent} e */
        openMenu(e) {
            /** @type {HTMLElement} */const elm = e.target;
            if (elm instanceof HTMLInputElement) return;
            if (elm instanceof HTMLTableCellElement) {
                const key = elm.parentElement.dataset.key;
                contextmenu.open(e, this, key)
            }
        },
        deleteItem(key) {
            if (this.comment._parse == "object") {
                this.$delete(this.value, key);
            } else this.value.splice(key, 1);
            this.$emit("change", this.value);
        },
        insertItem(key) { // 只允许数组类型使用key插入
            const { _items, _parse } = this.comment;
            const defaultValue = Array.isArray(_items)
                ? new Array(_items.length).fill(null)
                : null;
            if (_parse == "object") {
                if (this.value[""]) {
                    return;
                } else {
                    this.$set(this.value, "", defaultValue);
                    this.$emit("change", this.value);
                }
                return;
            }
            if (!key) key = this.value.length - 1;
            this.value.splice(key, 0, defaultValue);
            this.$emit("change", this.value);
        }
    }
}
</script>

<style lang="less">
.mt-table {
    table-layout: fixed;
    td {
        height: 18px;
        input {
            width: -webkit-fill-available;
        }
    }
}
</style>