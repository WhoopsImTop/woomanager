import Vue from 'vue'
import Vuex from 'vuex'
import TimeRecording from '../classes/timeClass'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        products: [],
        outOfStock: [],
        categories: [],
        foundScans: [],
        sellingReport: [],
        addList: [],
        scans: [],
        tags: [],
        loading: true,
        timeToday: [],
        orders: [],
        selectedScans: [],
        imageToken: '',
        selectedScanStatus: 'Bitte Auswählen',
        latestEdited: [],
        socket: null,
        users: [],
        timeTracking: new TimeRecording(),
        globalLoading: false,
        globalLoadingText: '',
        selectedProducts: [],
    },
    mutations: {
        addToList(state, payload) {
            state.latestEdited.push(payload)
            let arr = state.latestEdited.reverse()
            localStorage.setItem('latestEdited', JSON.stringify(arr))
        }
    },
    actions: {},
    modules: {}
})