import axios from 'axios'
import store from '../store'

export default class Product {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.regular_price = data.regular_price
    this.sale_price = data.sale_price
    this.images = data.images ? data.images : []
    this.description = data.description.replace(/(<([^>]+)>)/gi, '')
    this.categories = data.categories ? data.categories : []
    this.tags = data.tags ? data.tags : []
    this.backordered = false
    this.manage_stock = true
    this.stock_quantity = data.stock_quantity ? data.stock_quantity : 0
    this.manage_stock = data.manage_stock
    this.date_on_sale_from = data.date_on_sale_from
      ? data.date_on_sale_from.substring(0, 10)
      : null
    this.date_on_sale_to = data.date_on_sale_to
      ? data.date_on_sale_to.substring(0, 10)
      : null
    this.date_created = data.date_created
    this.date_modified = data.date_modified
    this.dimensions = data.dimensions
    this.ean_code = data.ean_code
    this.meta_data = [{
      "key": "_wpm_gtin_code",
      "value": data.ean_code,
    }]
    this.sku = data.sku
    this.status = this.TranslateStatus(data.status)
    this.permalink = data.permalink
    this.total_sales = data.total_sales
    this.type = data.type
    this.variations = data.variations
    if (this.variations && this.variations.length > 0) {
      this.getVariationData()
    }
  }

  TranslateStatus(status) {
    if(status === 'Entwurf' || status == 'Freigabe' || status === 'Öffentlich') {
    switch (status) {
      case 'Entwurf':
        return 'draft'
      case 'Freigabe':
        return 'pending'
      case 'Öffentlich':
        return 'publish'
    }
    } else {
      return status
    }
  }

  getId() {
    return this.id
  }

  getName() {
    return this.name
  }

  getregular_price() {
    return this.regular_price
  }

  getTotalSales() {
    return this.total_sales
  }

  updateProduct(product) {
    this.id = product.id
    this.name = product.name
    this.regular_price = product.regular_price
    this.sale_price = product.sale_price
    this.images = product.images
    this.description = product.description
    this.categories = product.categories
    this.tags = product.tags
    this.backordered = product.backordered
    this.stock_quantity = product.stock_quantity
    this.manage_stock = product.manage_stock
    this.date_on_sale_from = product.date_on_sale_from
      ? product.date_on_sale_from.substring(0, 10)
      : null
    this.date_on_sale_to = product.date_on_sale_to
      ? product.date_on_sale_to.substring(0, 10)
      : null
    this.date_created = product.date_created
    this.date_modified = product.date_modified
    this.dimensions = product.dimensions
    this.ean_code = product.ean_code
    this.meta_data = [{
      "key": "_wpm_gtin_code",
      "value": product.ean_code,
    }]
    this.sku = product.sku
    this.status = this.TranslateStatus(product.status)
    this.permalink = product.permalink
    this.total_sales = product.total_sales
    this.variations = product.variations

    //find _wpm_gtin_code meta data
    let metaData = this.meta_data.find((meta) => {
      return meta.key === '_wpm_gtin_code'
    })
    if (metaData) {
      metaData.value = this.ean_code
    } else {
      this.meta_data.push({
        id: 0,
        key: '_wpm_gtin_code',
        value: this.ean_code,
      })
    }

    if (this.variations && this.variations.length > 0) {
      this.updateVariations()
    }

    return new Promise((resolve, reject) => {
      axios
        .patch(
          `${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/${
            this.id
          }?consumer_key=${localStorage.getItem(
            'ck',
          )}&consumer_secret=${localStorage.getItem('cs')}`,
          this,
        )
        .then((response) => {
          this.updateFields(response.data)
          resolve('success')
        })
        .catch((error) => {
          console.log(error)
          reject('error')
        })
    })
  }

  updateFields(product) {
    this.id = product.id
    this.name = product.name
    this.regular_price = product.regular_price
    this.sale_price = product.sale_price
    this.images = product.images
    this.description = product.description
    this.categories = product.categories
    this.tags = product.tags
    this.backordered = product.backordered
    this.stock_quantity = product.stock_quantity
    this.manage_stock = product.manage_stock
    this.date_on_sale_from = product.date_on_sale_from
      ? product.date_on_sale_from.substring(0, 10)
      : null
    this.date_on_sale_to = product.date_on_sale_to
      ? product.date_on_sale_to.substring(0, 10)
      : null
    this.date_created = product.date_created
    this.date_modified = product.date_modified
    this.dimensions = product.dimensions
    this.ean_code = product.ean_code
    this.meta_data = [{
      "key": "_wpm_gtin_code",
      "value": product.ean_code,
    }]
    this.sku = product.sku
    this.status = this.TranslateStatus(product.status)
    this.permalink = product.permalink
    this.total_sales = product.total_sales
    this.variations = product.variations
  }

  updateEAN(ean) {
    this.ean_code = ean
    //find _wpm_gtin_code meta data
    let metaData = this.meta_data.find((meta) => {
      return meta.key === '_wpm_gtin_code'
    })
    if (metaData) {
      metaData.value = ean
    } else {
      this.meta_data.push({
        key: '_wpm_gtin_code',
        value: ean,
      })
    }

    return new Promise((resolve, reject) => {
      axios
        .patch(
          `${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/${
            this.id
          }?consumer_key=${localStorage.getItem(
            'ck',
          )}&consumer_secret=${localStorage.getItem('cs')}`,
          this,
        )
        .then((response) => {
          this.updateFields(response.data)
          resolve('success')
        })
        .catch((error) => {
          console.log(error)
          reject('error')
        })
    })
  }

  createProduct() {
    if(this.images.length === 0) {
      this.images.push({
        src: 'https://bindis-schaulaedle.de/wp-content/uploads/woocommerce-placeholder.png',
        id: 0,
      })
    }
    //wait for response from server
    return new Promise((resolve, reject) => {
      axios
        .post(
          `${localStorage.getItem(
            'shopURL',
          )}/wp-json/wc/v3/products?consumer_key=${localStorage.getItem(
            'ck',
          )}&consumer_secret=${localStorage.getItem('cs')}`,
          this,
        )
        .then((response) => {
          this.updateFields(response.data)
          store.state.products.unshift(this)
          resolve('success')
        })
        .catch((error) => {
          console.log(error)
          reject('error')
        })
    })
  }

  getVariationData() {
    for (let i = 0; i < this.variations.length; i++) {
      let data = new Promise((resolve, reject) => {
        axios
          .get(
            `${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/${
              this.id
            }/variations/${
              this.variations[i]
            }?consumer_key=${localStorage.getItem(
              'ck',
            )}&consumer_secret=${localStorage.getItem('cs')}`,
          )
          .then((response) => {
            return resolve(response.data)
          })
          .catch((error) => {
            console.log(error)
            return reject('error')
          })
      })
      data.then((data) => {
        this.variations[i] = data
      })
    }
  }

  updateVariations() {
    this.variations
      .forEach((variation) => {
        axios.patch(
          `${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/${
            this.id
          }/variations/${variation.id}?consumer_key=${localStorage.getItem(
            'ck',
          )}&consumer_secret=${localStorage.getItem('cs')}`,
          variation,
        )
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })
  }
}
