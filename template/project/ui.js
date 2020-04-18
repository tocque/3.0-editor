var ui_58d7f25a_328d_49b6_a5d8_ec20228f6b56 =
{
    "components": function() {
        // 此处定义所有全局组件
        return {
            "pagination": {
                
            }
        }
    },
    "book": function() {

        const enemyItem = {
            props: ["enemyInfo"],
            template: /* HTML */`
            <div @click="$open('bookDetail', enemyInfo)">

            </div>
            `
        }

        return {
            data() {
                return {
                    floorId: '',
                    index: 0,
                    enemys: [],
                }
            },
            created() {
                this.floorId = core.floorIds[(core.status.event.ui||{}).index] || core.status.floorId;
                this.enemys = core.enemys.getCurrentEnemys(floorId);
                core.maps.generateGroundPattern(this.floorId);
            },
            less: {
                '#emptyText': {
                    position: "fixed",
                    anchorX: "50%",
                    anchorY: "50%",
                    font: "50px bold",
                    color: '#999999'
                },
                'main': {
                    'div::selection': {
                        
                    }
                },
                'footer': {
                    display: "flex",
                    'span': {
                        position: "fixed",
                        right: 46,
                        bottom: 13,
                        font: "15px bold",
                        color: '#DDDDDD'
                    }
                }
            },
            template: /* HTML */`
            <div>
                <main v-if="enemys.length">
                    <enemy-item
                        v-for="i of HSIZE" :key="i"
                        :enemyinfo="enemys[i+index*HSIZE]"
                    ></enemy-item>
                </main>
                <span id="emptyText" v-else>本层无怪物</span>
                <footer>
                    <mt-pagination></mt-pagination>
                    <span @click="$click">返回游戏</span>
                </footer>
            </div>
            `,
            methods: {

            },
            shortCut() {
                const s = {
                    'up': () => this.moveselector(-1),
                    'down': () => this.moveselector(1),
                };
                s['esc'] = s['x'] = this.$close;
                return s;
            },
            components: {
                enemyItem
            }
        }
    }
}