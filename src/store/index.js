import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    products: [],
    outOfStock: [],
    categories: [],
    tags: [],
    loading: false,
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
