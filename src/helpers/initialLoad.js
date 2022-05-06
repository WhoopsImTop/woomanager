import axios from 'axios'
import Product from '../classes/productClass'
import store from '../store'

function getProducts(page) {
  axios
    .get(`https://bindis-schaulaedle.de/wp-json/wc/v3/custom?page=${page}`)
    .then((response) => {
      if (response.data.length > 0) {
        for (let i = 0; i < response.data.length; i++) {
          let product = new Product(response.data[i])
          store.state.products.unshift(product)
        }
        getProducts(page + 1)
      } else {
        console.log('done')
      }
    })
}


export default getProducts;