import store from "../../store.js"

store.registerModule('map', {
    namespaced: true,
    state: {
        currentMapid: '',
    },
    mutations: {
        openMap(state, newMapid) {
            state.currentMapid = newMapid;
        }
    }
})
