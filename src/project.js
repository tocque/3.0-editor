import config from "./config.js"
import { baseURL } from "./fs.js"
import store from "./store.js"
import { pack } from "./game/packager.js"
const compressing = require('compressing');
const _path = require('path');

const info = new config("./projectInfo.json");
const save = async function() {
    return info.set("history", store.state.$project.history);
}

store.registerModule('$project', {
    namespaced: true,
    state: {
        history: [],
        now: null,
        packaging: false,
        packagingState: "",
    },
    mutations: {
        load(state, history) {
            state.history = history;
        },
        add(state, project) {
            state.history.push(project);
        },
        open(state, path) {
            const project = state.history.find(e => e.path == path);
            project.lastEditTime = Date.now();
            state.now = project;
        },
        close(state) {
            state.now = null;
        },
        commit(state) {
            state.now.lastEditTime = Date.now();
        },
        startBuild(state) {
            state.packaging = true;
        },
        finishBuild(state) {
            state.packaging = false;
            state.now.lastBuildTime = Date.now();
        },
        onBuild(state, newState) {
            state.packagingState = newState;
        }
    },
    getters: {
        currentPath(state) {
            return state.now.path
        }
    },
    actions: {
        async add({ commit }, project) {
            if (!project.name) project.name = _path.basename(project.path);
            commit('add', project);
            return save();
        },
        async open({ commit }, path) {
            commit('open', path);
            return save();
        },
        async create({ dispatch }, path) {
            const project = {
                dir: path,
                name: _path.basename(path),
                lastBuildTime: 0,
                lastEditTime: Date.now()
            }
            await dispatch('add', project);
            return compressing.zip.uncompress(baseURL+'game/template.zip', path)
        },
        async build({ commit, getters }, to) {
            commit('startBuild');
            await pack(
                getters.currentPath, 
                _path.resolve(getters.currentPath, to),
                (e) => commit('onBuild', e)
            );
            commit('finishBuild');
        }
    }
})

export default new class ProjectManager {

    async init() {
        await info.loaded;
        store.commit('$project/load', info.get("history", []));
    }

}