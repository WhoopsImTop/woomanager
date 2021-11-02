<template>
  <div class="my-4">
    <v-btn 
      class="btn-danger"
      large
      >
      {{ getOutOfStock }} von {{ getProducts }} Produkten sind ausverkauft
      </v-btn>
  </div>
</template>

<script>

export default {
  name: 'Home',
  computed: {
    getOutOfStock() {
      return this.$store.state.outOfStock.length
    },
    getProducts() {
      return this.$store.state.products.length
    }
  }
}
</script>
