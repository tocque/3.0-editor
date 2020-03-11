import { ftools, JsFile } from "../../editor_file.js";

export const mapStore = new Vuex.Store({
    state: {
        currentMapid: '',
    },
    mutations: {
        openMap(state, newMapid) {
            state.currentMapid = newMapid;
        }
    }
})