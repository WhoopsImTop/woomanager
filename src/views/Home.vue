<template>
  <div>
    <v-btn color="primary" @click="getData()">GET REQUEST</v-btn>
  </div>
</template>

<script>
import requestor from '../helpers/requestor'
export default {
  name: 'Home',
  methods: {
    async getData() {
      let data = await requestor("GET", "products", "per_page=100")
      console.log(data)
    }
  }
}
</script>
