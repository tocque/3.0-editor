<template>
    <div id="projectPanel" :class="{ opened: currentProject }">
        <div class="left">
            <mt-board label="开始工程" ref="start">
                <li><a class="link-btn" @click="newProject">新建工程</a></li>
                <li><a class="link-btn" style="color: #AAAAAA;">从2.x导入</a></li>
            </mt-board>
            <mt-board label="已有工程" class="history" ref="history">
                <li v-for="(project, i) of recent" :key="i">
                    <a class="link-btn" @click="open(project)">{{ project.name }}</a>
                    <span class="projectURL" :title="project.path">{{ project.path }}</span>
                </li>
                <li><a class="link-btn" @click="importProject">导入工程</a></li>
            </mt-board>
            <mt-board label="当前工程" v-if="currentProject">
                <li v-if="loading">
                    <section>
                        <h5>启动服务</h5>
                        <mt-progress-bit></mt-progress-bit>
                        <p>{{ loadingState }}</p>
                    </section>
                </li>
                <li>
                    <section>
                        <h5>信息统计</h5>
                    </section>
                </li>
                <li v-if="!loading">
                    <section>
                        <h5>测试</h5>
                        <p>测试服务器端口: {{ port }}</p>
                        <a class="link-btn" :href="'http://127.0.0.1:'+port+'/index.html'">测试游戏</a>
                    </section>
                </li>
                <li v-if="!loading">
                    <section>
                        <h5>构建</h5>
                        <p>上次构建时间: {{ lastBuildTime }}</p>
                        <a class="link-btn" @click="build">进行构建</a>
                        <p v-if="packaging">
                            <mt-icon class="codicon-animation-shrink" icon="file-zip"></mt-icon>
                            {{ packagingState }}
                        </p>
                    </section>
                </li>
            </mt-board>
        </div>
        <div class="right">
            <mt-board label="资源">
                <li><a class="link-btn" href="https://www.bilibili.com/video/av32781473/" target="_blank">视频教程</a></li>
                <li><a class="link-btn" href="https://pan.baidu.com/s/1vXICR79ZoP5LXujhlAjN-A" target="_blank">常用素材</a></li>
                <li><a class="link-btn" href="https://h5mota.com/games/template/_docs/" target="_blank">帮助文档</a></li>
            </mt-board>
            <mt-board label="社区">
                <li><a class="link-btn" href="https://jq.qq.com/?_wv=1027&k=5JGA2dh" target="_blank">造塔技术群</a></li>
                <li><a class="link-btn" href="https://h5mota.com/bbs/main/" target="_blank">论坛</a></li>
            </mt-board>
            <mt-board label="编辑器配置">
                <li>
                    <section>
                        <h5>版本信息</h5>
                        <p>当前版本: {{ edition }}</p>
                    </section>
                </li>
            </mt-board>
        </div>
    </div>
</template>

<script>
/**
 * @file project_panel/index.js 工程管理界面
 * 在未载入游戏时该界面可浏览, 故create中不能写入游戏查询相关
 */
import game from "../../game.js";
import project from "../../project.js"
import { selectFile, localfs } from "../../fs.js";

export default {
    label: "工程",
    data() {
        return {
            active: false,
            edition: editor.version,
        }
    },
    computed: {
        ...Vuex.mapState('$project', {
            currentProject: 'now',
            history: 'history',
            packaging: 'packaging',
            packagingState: 'packagingState',
        }),
        ...Vuex.mapState('$game', {
            loading: 'loading',
            loadingState: 'loadingState',
            port: "port",
        }),
        recent() {
            return this.history.concat()
                .sort((a, b) => b.lastEditTime - a.lastEditTime)
                .slice(0, 5);
        },
        lastBuildTime() {
            const timestamp = this.currentProject.lastBuildTime;
            if (timestamp == 0) return '未构建过';
            const delta = Date.now() - timestamp;
            if (delta < 60) return '刚刚';
            if (delta < 3600) return Math.floor(delta/60)+'分钟前';
            if (delta < 86400) return Math.floor(delta/3600)+'小时前';
            return new Date(timestamp).toLocaleString();
        }
    },
    activated() {
        this.active = true;
    },
    deactivated() {
        this.active = false;
    },
    methods: {
        async newProject() {
            const path = await selectFile('directory');
            if (!path) return;
            try {
                const newProject = await this.$store.dispatch('$project/create', path);
                this.open(newProject);
            } catch (e) {
                this.$notify.error("无法在指定目录创建工程: " + e);
                return;
            }
        },
        async importProject() {
            const path = await selectFile('directory');
            if (!path) return;
            if (!localfs.isExist(path+'/work.h5mota')) {
                this.$notify.error("不是完整的3.0工程, 目前版本不支持导入2.x工程");
                return;
            }
            const imported = {
                path,
                lastBuildTime: 0,
                lastEditTime: Date.now()
            }
            await this.$store.dispatch('$project/add', imported);
            this.open(imported);
        },
        open(project) {
            this.$store.dispatch("openProject", project);
            this.$refs.start.fold();
            this.$refs.history.fold();
        },
        async build() {
            if (this.packaging) return;
            const startTime = Date.now();
            await this.$store.dispatch("build", "./output");
            this.$print(`构建成功, 总用时: ${Date.now() - startTime}ms`);
        }
    },
    components: {

    },
}
</script>

<style lang="less">
#projectPanel {
    background: #1E1E1E;
    line-height: 24px;
    >.left, >.right {
        width: 50%;
    }
    >.left .mt-board {
        margin-left: 12%;
        margin-right: 6%;
    }
    >.right .mt-board {
        margin-left: 6%;
        margin-right: 12%;
    }
    .mt-board {
        section {
            padding: 10px;
            margin: 5px;
            background: #000000;
            h5 {
                margin: 0;
                font-size: inherit;
                font-weight: initial;
                color: #CCCCCC;
            }
            p {
                margin: 0;
                margin-left: 5px;
                color: #CCCCCCCC;
            }
        }
    }
    .history li {
        display: flex;
    }
    .projectURL {
        margin-left: 10px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--c-text-dis);
    }
}
</style>
