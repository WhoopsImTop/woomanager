<template>
  <div>
    <v-data-table
      dark
      :items="searchProducts"
      :items-per-page="15"
      :headers="headers"
      item-key="id"
      class="glass2"
    >
      <template v-slot:top>
        <v-toolbar flat class="glass border-rounded my-3">
          <h1 style="margin: 20px 0">Produkte bearbeiten</h1>
          <v-spacer></v-spacer>
          <v-col cols="2">
            <v-text-field
              style="margin: 0; height: 56px"
              label="Suche"
              outlined
              v-model="search"
              @input="filteredName"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-combobox
              chips
              outlined
              deletable-chips
              style="margin: 0; height: 56px"
              label="Kategorie"
              v-model="filter"
              :items="$store.state.categories"
              @change="filteredCategories"
              item-text="name"
            >
            </v-combobox>
          </v-col>
        </v-toolbar>
      </template>
      <template v-slot:item.nameTag="{ item }">
        <v-text-field
          style="margin: 0; height: 56px"
          v-model="item.name"
          outlined
          label="Name"
        ></v-text-field>
      </template>
      <template v-slot:item.priceTag="{ item }">
        <v-text-field
          style="margin: 0; height: 56px"
          v-model="item.price"
          outlined
          label="Preis"
        ></v-text-field>
      </template>
      <template v-slot:item.stockTag="{ item }">
        <v-text-field
          style="margin: 0; height: 56px"
          v-model="item.stock_quantity"
          outlined
          label="Bestand"
        ></v-text-field>
      </template>
      <template v-slot:item.eanTag="{ item }">
        <v-text-field
          style="margin: 10px 0; height: 56px"
          v-model="item.ean_code"
          outlined
          label="EAN"
        ></v-text-field>
      </template>
      <template v-slot:item.actions="{ item, index }">
        <v-btn
          icon
          color="dark"
          :loading="loading && indexClicked === index"
          @click="saveItem(item, index)"
        >
        <v-icon small > mdi-check </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data: () => ({
    search: "",
    filter: "",
    loading: false,
    indexClicked: null,
    searchProducts: [],
    headers: [
      {
        text: "Name",
        align: "start",
        value: "nameTag",
      },
      {
        text: "Preis",
        aling: "start",
        value: "priceTag",
      },
      {
        text: "Bestand",
        aling: "start",
        value: "stockTag",
        sortable: true,
      },
      {
        text: "EAN",
        aling: "start",
        value: "eanTag",
      },
      { text: "Aktionen", value: "actions", align: "end", sortable: false },
    ],
  }),
  methods: {
    // filter by category
    filteredCategories() {
      let filter;
      if (this.filter === null) {
        filter = ""
      } else {
        filter = this.filter.name ? this.filter.name.toLowerCase() : ""
      }
      if(filter != ""){
        let SearchItems = [];
        this.$store.state.products.filter((product) => {
          product.categories.forEach((item) => {
            if (item.name.toLowerCase() == filter) {
              SearchItems.push(product);
            }
          });
        });
        this.searchProducts = SearchItems;
      } else {
        this.searchProducts = this.$store.state.products;
      }
    },
    //filter by name
    filteredName() {
      this.searchProducts = this.$store.state.products.filter((product) => {
        return product.name.toLowerCase().includes(this.search.toLowerCase());
      });
    },
    // save item
    saveItem(item, index) {
      this.indexClicked = index;
      this.loading = true;
      console.log(item)
      axios
      .patch(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/${item.id}/?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc`, {
        item
      })
      .then((response) => {
        console.log(response);
        this.loading = false;
        this.indexClicked = null;
        this.$store.state.products[this.$store.state.products.indexOf(item)] = item;
      })
      .catch(() => {
        window.alert("Es gabt einen Fehler, probiere es erneut")
        this.loading = false;
        this.indexClicked = null;
      });
    },
  },
  created() {
    this.searchProducts = this.$store.state.products;
  },
};
</script>
