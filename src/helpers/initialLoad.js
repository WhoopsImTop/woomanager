import axios from 'axios'
import Product from '../classes/productClass'
import store from '../store'

function getProducts() {
  store.state.globalLoading = true
  store.state.globalLoadingText = 'Lade Produkte...'
  axios
    .get(
      `${localStorage.getItem(
        'shopURL',
      )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
        'ck',
      )}&consumer_secret=${localStorage.getItem('cs')}&per_page=20`,
    )
    .then((response) => {
      for (let i = 0; i < response.data.length; i++) {
        let product = new Product(response.data[i])
        store.state.products.unshift(product)
      }
      getCategories(1)
    })
}

function getCategories(page) {
  store.state.globalLoadingText = 'Lade Kategorien...'
  axios
    .get(
      `${localStorage.getItem(
        'shopURL',
      )}/wp-json/wc/v3/products/categories/?consumer_key=${localStorage.getItem(
        'ck',
      )}&consumer_secret=${localStorage.getItem(
        'cs',
      )}&per_page=100&page=${page}`,
    )
    .then((response) => {
      if (response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
          store.state.categories.push(response.data[i])
        }
        getCategories(page + 1)
      } else {
        getTags(1)
      }
    })
}

function getTags(page) {
  store.state.globalLoadingText = 'Lade Tags...'
  axios
    .get(
      `${localStorage.getItem(
        'shopURL',
      )}/wp-json/wc/v3/products/tags/?consumer_key=${localStorage.getItem(
        'ck',
      )}&consumer_secret=${localStorage.getItem(
        'cs',
      )}&per_page=100&page=${page}`,
    )
    .then((response) => {
      if (response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
          store.state.tags.push(response.data[i])
        }
        getTags(page + 1)
      } else {
        getOrders(1)
      }
    })
}

function getOrders(page) {
  store.state.globalLoadingText = 'Lade Bestellungen...'
  axios
    .get(
      `${localStorage.getItem(
        'shopURL',
      )}/wp-json/wc/v3/orders/?consumer_key=${localStorage.getItem(
        'ck',
      )}&consumer_secret=${localStorage.getItem(
        'cs',
      )}&per_page=100&page=${page}`,
    )
    .then((response) => {
      if (response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
          store.state.orders.push(response.data[i])
        }
        getOrders(page + 1)
      } else {
        store.state.globalLoadingText = 'Alles geladen'
        store.state.globalLoading = false
      }
    })
}

export default getProducts
