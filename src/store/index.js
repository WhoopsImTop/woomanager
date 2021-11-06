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
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
