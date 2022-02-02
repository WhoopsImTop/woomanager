import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import BarcodeScanner from '../views/Scans.vue'
import Category from '../views/Category.vue'
import Tags from '../views/Tags.vue'
import List from '../views/List.vue'
import Orders from '../views/Orders.vue'
import addProducts from '../views/addProducts.vue'
import workTimeRecording from '../views/workTimeRecording.vue'
import fastProductEditor from '../views/fastProductEditor.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Produkte',
    component: Products
  },
  {
    path: '/scanner',
    name: 'BarcodeScanner',
    component: BarcodeScanner
  },
  {
    path: '/categories',
    name: 'Category',
    component: Category
  },
  {
    path: '/tags',
    name: 'Tags',
    component: Tags
  },
  {
    path: '/list',
    name: 'List',
    component: List
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/add',
    name: 'addProducts',
    component: addProducts
  },
  {
    path: '/workTime',
    name: 'workTimeRecording',
    component: workTimeRecording
  },
  {
    path: '/fastEdit',
    name: 'fastProductEditor',
    component: fastProductEditor
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
