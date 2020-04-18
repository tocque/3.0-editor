/**
 * @file store.js 全局vuex store
 */
import game from "./game.js"

export default new Vuex.Store({
    state: {
        projectName: ""
    },
    mutations: {
        getProjectName(state) {
            state.projectName = game.get("data/data/projectName");
        }
    },
    actions: {
        async openProject({ commit, dispatch, state }, { path }) {
            if (state.$game.linked) dispatch('closeProject');
            dispatch("$project/open", path);
            await dispatch("$game/serve", path);
            commit('getProjectName');
        },
        closeProject({ commit, dispatch }) {
            commit("$game/close");
            dispatch("$game/stop");
        },
    }
})