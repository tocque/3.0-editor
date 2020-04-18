<template>
    <mt-window :active.sync="active" title="新建地图" width="40%" 
        class="createMap" mask closeBtn @close="cancel()" ref="form">
        <mt-form-item label="批量创建">
            <mt-switch v-model="form.batchCreate"></mt-switch>
        </mt-form-item>
        <mt-form-item label="新地图ID">
            <input class="mt-input" :placeholder="form.batchCreate ? 'MT${i}' : '新地图ID'" 
            v-model="form.mapid"/>
        </mt-form-item>
        <mt-form-item label="新地图名称">
            <input class="mt-input" :placeholder="form.batchCreate ? '${i}' : '新地图名称'" 
            v-model="form.name"/>
        </mt-form-item>
        <mt-form-item label="状态栏显示的名称">
            <input class="mt-input" :placeholder="form.batchCreate ? '主塔 ${i} 层' : '新地图名称'" 
            v-model="form.name"/>
        </mt-form-item>
        <mt-form-item label="地图尺寸" class="batchParam">
            <span>宽</span>
            <input class="mt-input" type="number" v-model="form.Width"/>
            <span>高</span>
            <input class="mt-input" type="number" v-model="form.Height"/>
        </mt-form-item>
        <mt-form-item label="继承楼层属性">
            <mt-switch v-model="form.extends"></mt-switch>
        </mt-form-item>
        <mt-form-item v-if="form.batchCreate"
            label="批量参数" class="batchParam"
            title="系统会将每个i值依次代入到地图名中的${i}中, 计算出地图名"
        >
            <span>从 i=</span>
            <input class="mt-input" type="number" v-model='form.from'/>
            <span>到</span>
            <input class="mt-input" type="number" v-model='form.to'/>
        </mt-form-item>
        <template slot="foot">
            <mt-btn @click="comfirm(newMap)">确认创建</mt-btn>
        </template>
    </mt-window>
</template>

<script>
import { isset } from '../../utils.js';
import game from '../../game.js';

export default {
    data() {
        return {
            active: false,
            form: {
                batchCreate: false,
                extends: false,
                width: 13,
                height: 13,
                mapid: "",
                name: "",
                title: "",
                from: 1,
                to: 5
            }
        }
    },
    methods: {
        open() {
            this.active = true;
            return new Promise(res => {
                this.res = res;
            })
        },
        comfirm() {
            this.validate(this.form).then(() => {
                this.res(this.form);
                this.$refs.form.close();
            }).catch((e) => {
                this.$print(e, 'warn');
            })
        },
        cancel() {
            this.res();
        },
        async validate({ batchCreate, from, to, mapid }) {
            return new Promise((res, rej) => {
                if (batchCreate) {
                    if (!isset(from) || !isset(to) || from > to || from < 0 || to < 0) {
                        rej("请输入有效的起始和终止楼层");
                    }
                    if (to - from >= 100) {
                        rej("一次最多创建99个楼层");
                    }
                    const mapList = [];
                    for (let i = from; i < to; i++) {
                        mapList.push(eval("`"+mapid+"`"));
                    }
                    game.post("map/validate", mapList)
                        .then((err) => {
                            if (isset(err)) rej(err);
                            else res()
                        });
                } else {
                    game.post("map/validate", mapid)
                        .then((err) => {
                            if (isset(err)) rej(err);
                            else res()
                        });
                }
            })
        }
    }
}
</script>

<style lang="less">
.createMap.mt-window {
    top: 24%;
    .mt-window__content {
        padding: 10px;
    }
    .batchParam, .mapSize {
        span {
            vertical-align: bottom;
        }
        .mt-input {
            width: 45px;
        }
    }
}
</style>