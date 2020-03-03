import { ftools, jsFile } from "../../editor_file.js";

export const mapStore = new Vuex.Store({
    state: {
        currentMapid: ''
    },
    mutations: {
        openMap(state, newMap) {
            state.currentMapid = newMap;
        }
    }
})