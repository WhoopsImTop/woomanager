import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    products: [],
    outOfStock: [],
    categories: [],
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
    workTime: 0,
    startTime: null,
    endTime: null,
  },
  mutations: {
    addToList (state, payload) {
      state.latestEdited.push(payload)
      let arr = state.latestEdited.reverse()
      localStorage.setItem('latestEdited', JSON.stringify(arr))
    }
  },
  actions: {
  },
  modules: {
  }
})
