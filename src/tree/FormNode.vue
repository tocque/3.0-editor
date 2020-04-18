<script>
import getInput from "./inputs.js";
import { exec } from "../utils.js"

export default {
    name: "form-node",
    render() {
        const comment = this.comment;
        return (
            <div class="control-node" 
                title={ comment._data+this.data.field }
                field={ this.data.field }
            >
                <div class="control-content">
                    <span class="comment">{ comment._name }</span>
                    <div class="control-input">
                        { exec(this.inner) }
                        { this.external
                            ?  (<mt-icon 
                                class="fold-btn" 
                                onclick={ () => this.fold = !this.fold }
                                icon={'chevron-'+ (this.fold ? 'down' : 'up')}
                                title={ this.fold ? '展开' : '折叠' }
                            ></mt-icon>)
                            : void 0
                        }
                    </div>
                </div>
                { exec(this.external) }
            </div>
        );
    },
    inject: ["openBlockly"],
    props: ["node", "data"],
    computed: {
        showFold() {
            return ["table", "textarea"].includes(this.comment._type);
        }
    },
    data: function() {
        return {
            comment: '',
            value: '',
            fold: false
        }
    },
    created() {
        const type = this.data.comment._type;
        const _input = getInput(type);
        ["inner", "external", "defaultValidate", "init"].forEach((e) => {
            if (_input[e]) this[e] = _input[e].bind(this);
        })
        for (let i in _input.methods) {
            this[i] = _input.methods[i].bind(this);
        }
        this.comment = this.data.comment;
        if (this.init) {
            this.value = this.init(this.data.data, this.comment);
        } else {
            this.value = this.data.data;
        }
    },
    mounted() {
        if (this.comment._type == 'textarea') this.resize();
    },
    methods: {
        onchange() {
            const field = this.data.field;
            const value = this.value;
            // try {
            //     if (value === '') value = 'null';
            //     thiseval = JSON.parse(value);
            // } catch (ee) {
            //     this.$print(field + ' : ' + ee, 'warn');
            //     return;
            // }
            this.checkRange(this.comment, value).then((res) => {
                if (res) {
                    this.$el.dispatchEvent(new CustomEvent("changeNode", {
                        detail: { field, value },
                        bubbles: true,
                    }));
                } else {
                    this.$print(field + ' : 输入的值不合要求,请将鼠标放置在编辑项上查看说明', 'warn');
                }
            });
        },
        /**
         * 检查一个值是否允许被设置为当前输入
         * @param {comment} comment 
         * @param {*} thiseval 
         */
        async checkRange(comment, thiseval) {
            if (thiseval == null && comment._unrequired) return false;
            if (this.defaultValidate) {
                if (!this.defaultValidate(thiseval, this)) return false;
            }
            if (comment._range) {
                return comment._range(thiseval);
            }
            return true;
        },
    }
}
</script>

<style lang="less">
.control-node {
    width: 100%;
    .control-content {
        display: flex;
        justify-content: space-between;
        width: -webkit-fill-available;
    }
    select {
        width: 124px;
        background-color: #444;
        border: none;
        padding: 2px;
        color: var(--c-text);
    }
    .control-input>.mt-input {
        max-width: 120px;
    }
    input[type="number"] {
        background-color: #444;
        border: none;
        padding: 2px;
        color: var(--c-text);
        max-width: 100px;
    }
    span.const {
        font-weight: bold;
        padding: 0px 5px;
    }
    table {
        font-size: 14px;
        width: 100%;
        margin-top: 2px;
        border-top: 1px solid;
        border-left: 1px solid;
        td {
            border-right: 1px solid;
            border-bottom: 1px solid;
            padding: 1px;
        }
    }
    .mt-textarea {
        font-size: 14px;
        background: #444444;
        resize: none;
        width: 100%;
        color: var(--c-text);
    }
    .fold-btn, .add-btn {
        cursor: pointer;
        display: none;
    }
    .add-btn {
        margin-right: 2px;
    }
    &:hover {
        .fold-btn, .add-btn {
            display: inline;
        }
    }
}
</style>