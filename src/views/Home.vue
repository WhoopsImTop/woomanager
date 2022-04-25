<template>
  <div class="my-4">
    <v-btn class="btn-danger" large>
      {{ getOutOfStock }} von {{ getProducts }} Produkten sind ausverkauft
    </v-btn>
    <v-divider dark class="my-4"></v-divider>
    <v-row cols="12">
      <v-col cols="6">
        <v-text-field outlined label="Dateiname" v-model="filename" dark>
        </v-text-field>
      </v-col>
      <v-col cols="6">
        <v-combobox
          multiple
          outlined
          label="Felder"
          v-model="selectedFields"
          :items="productFields"
          dark
        >
        </v-combobox>
      </v-col>
      <v-col v-show="selectedFields.includes('Kategorie')" cols="4">
        <v-combobox
          multiple
          outlined
          label="Kategorie Filter"
          v-model="categorieFilter"
          :items="$store.state.categories"
          item-text="name"
          dark
        >
        </v-combobox>
      </v-col>
      <v-col v-show="selectedFields.includes('Schlagwörter')" cols="4">
        <v-combobox
          multiple
          outlined
          label="Schlagwortfilter Filter"
          v-model="tagFilter"
          :items="$store.state.tags"
          item-text="name"
          dark
        >
        </v-combobox>
      </v-col>
      <v-col v-show="selectedFields.includes('Bestand')" cols="4">
        <v-text-field
          outlined
          type="number"
          label="Bestandsfilter"
          v-model="stockFilter"
          dark
        >
        </v-text-field>
      </v-col>
      <v-col cols="4">
        <v-btn
          v-if="selectedFields != 0"
          icon
          block
          x-large
          dark
          class="glass"
          @click="ExportSold"
          :loading="loading"
        >
          <v-icon class="mr-5">mdi-download</v-icon>
          Liste herunterladen
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <h3>Bestseller</h3>
        <v-list dark class="glass2">
          <v-list-item-group dark>
            <v-list-item v-for="(item, i) in topseller" :key="i">
              <v-list-item-content>
                <v-list-item-title v-text="item.name"></v-list-item-title>
                <v-list-item-subtitle>{{item.total_sales}}x Verkauft</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import exportCSV from "../helpers/excelExporter";
import axios from "axios";

export default {
  name: "Home",
  data: () => {
    return {
      filename: "",
      selectedFields: [],
      categorieFilter: [],
      loading: false,
      tagFilter: [],
      stockFilter: 999,
      productFields: [
        "Produktname",
        "Preis",
        "Bestand",
        "Beschreibung",
        "Kategorie",
        "Schlagwörter",
        "Bild",
        "EAN",
        "Artikelnummer",
        "Link",
      ],
      series: [
        {
          name: "Anfragen",
          data: [],
        },
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: "area",
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
        },
        xaxis: {
          type: "datetime",
          categories: [],
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm",
          },
        },
      },
    };
  },
  components: {
  },
  computed: {
    getOutOfStock() {
      return this.$store.state.outOfStock.length;
    },
    getProducts() {
      return this.$store.state.products.length;
    },
    topseller() {
      let products = this.$store.state.products;
      // sort array by total_sales and take the first 10
      products.sort((a, b) => {
        return b.total_sales - a.total_sales;
      });
      return products.slice(0, 7);
    },
  },
  methods: {
    init() {
      axios
        .get("https://bindis.rezept-zettel.de/api/requests/")
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            this.chartOptions.xaxis.categories.push(response.data[i].time);
            this.series[0].data.push(response.data[i].request);
          }
          this.chartOptions.tooltip.x.format = "dd/MM/yy HH:mm";
        });
    },
    async ExportSold() {
      let fields = this.selectedFields;
      let colArray = [];
      for (let i = 0; i < fields.length; i++) {
        switch (fields[i]) {
          case "Produktname":
            colArray.push({
              column: "Produktname",
              value: (product) => product.name,
              width: 50,
            });
            break;
          case "Preis":
            colArray.push({
              column: "Preis",
              value: (product) => product.price,
              width: 50,
            });
            break;
          case "Bestand":
            colArray.push({
              column: "Bestand",
              value: (product) => product.stock_quantity,
              width: 50,
            });
            break;
          case "Beschreibung":
            colArray.push({
              column: "Beschreibung",
              value: (product) => product.description,
              width: 50,
            });
            break;
          case "Kategorie":
            colArray.push({
              column: "Kategorie",
              value: (product) =>
                product.categories.map((category) => category.name),
              width: 50,
            });
            break;
          case "Schlagwörter":
            colArray.push({
              column: "Schlagwörter",
              value: (product) => product.tags.map((tag) => tag.name),
              width: 50,
            });
            break;
          case "Bild":
            colArray.push({
              column: "Bild",
              value: (product) => product.images.map((image) => image.src),
              width: 50,
            });
            break;
          case "EAN":
            colArray.push({
              column: "EAN",
              value: (product) => product.ean_code,
              width: 50,
            });
            break;
          case "Artikelnummer":
            colArray.push({
              column: "Artikelnummer",
              value: (product) => product.sku,
              width: 50,
            });
            break;
          case "Link":
            colArray.push({
              column: "Link",
              value: (product) => product.permalink,
              width: 50,
            });
            break;
        }
      }
      this.loading = true;
      let data = await this.filterProducts();
      this.loading = false;
      exportCSV(data, colArray, this.filename);
    },
    filterCategoires() {
      let newData = [];
      for (let x = 0; x < this.$store.state.products.length; x++) {
        for (let k = 0; k < this.categorieFilter.length; k++) {
          for (
            let i = 0;
            i < this.$store.state.products[x].categories.length;
            i++
          ) {
            if (
              this.$store.state.products[x].categories[i].name ===
              this.categorieFilter[k].name
            ) {
              newData.push(this.$store.state.products[x]);
            }
          }
        }
      }
      return newData;
    },
    filterTags(data) {
      let newData = [];
      if (data.length !== 0) {
        if (this.tagFilter.length !== 0) {
          for (let x = 0; x < data.length; x++) {
            for (let k = 0; k < this.tagFilter.length; k++) {
              for (let i = 0; i < data[x].tags.length; i++) {
                if (data[x].tags[i].name === this.tagFilter[k].name)
                  data.splice(x, 1);
              }
            }
          }
        }
        newData = data;
      } else {
        for (let x = 0; x < this.$store.state.products.length; x++) {
          if (this.tagFilter.length !== 0) {
            for (let k = 0; k < this.tagFilter.length; k++) {
              for (
                let i = 0;
                i < this.$store.state.products[x].tags.length;
                i++
              ) {
                if (
                  this.$store.state.products[x].tags[i].name ===
                  this.tagFilter[k].name
                ) {
                  newData.push(this.$store.state.products[x]);
                }
              }
            }
          }
        }
      }
      return newData;
    },
    filterStock(data) {
      let newData = [];
      if (data.length !== 0 && this.stockFilter != 999) {
        data.filter((product) => {
          if (product.stock_quantity <= this.stockFilter) {
            newData.push(product);
          }
        });
      } else {
        if (this.stockFilter != 999) {
          for (let x = 0; x < this.$store.state.products.length; x++) {
            console.log(this.$store.state.products.length);
            if (
              this.$store.state.products[x].stock_quantity <=
                this.stockFilter ||
              this.$store.state.products[x].stock_quantity === undefined ||
              this.$store.state.products[x].stock_quantity === null
            ) {
              newData.push(this.$store.state.products[x]);
            }
          }
        }
      }
      return newData;
    },
    async filterProducts() {
      let data = [];
      if (
        this.categorieFilter.length === 0 &&
        this.tagFilter.length === 0 &&
        this.stockFilter === ""
      ) {
        data = this.$store.state.products;
      } else {
        data = await this.filterCategoires(data);
        data = await this.filterTags(data);
        data = await this.filterStock(data);
      }
      return data;
    },
  },
  beforeMount() {
    this.init();
  },
};
</script>