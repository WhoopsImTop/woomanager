<template>
  <div class="my-4">
    <v-btn 
      class="btn-danger"
      large
      >
      {{ getOutOfStock }} von {{ getProducts }} Produkten sind ausverkauft
      </v-btn>
      <v-divider dark class="my-4"></v-divider>
      <v-row cols="12">
        <v-col cols="6">
          <v-text-field
            outlined
            label="Dateiname"
            v-model="filename"
            dark
          >
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
            label="Bestandsfilter"
            v-model="stockFilter"
            dark
          >
          </v-text-field>
        </v-col>
        <v-col cols="4">
          <v-btn
          icon
          block
          x-large
          dark
          class="glass"
          @click="ExportSold"
          >
            <v-icon class="mr-5">mdi-download</v-icon>
            Liste herunterladen
          </v-btn>
        </v-col>
      </v-row>
  </div>
</template>

<script>
import exportCSV from '../helpers/excelExporter'
export default {
  name: 'Home',
  data: () => {
    return  {
      filename: '',
      selectedFields: [],
      categorieFilter: [],
      tagFilter: [],
      stockFilter: '',
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
      ]
    }
  },
  computed: {
    getOutOfStock() {
      return this.$store.state.outOfStock.length
    },
    getProducts() {
      return this.$store.state.products.length
    }
  },
  methods: {
    ExportSold() {
      let fields = this.selectedFields
      let colArray = [];
      for(let i = 0; i < fields.length; i++) {
        switch(fields[i]) {
          case "Produktname":
            colArray.push({
              column: 'Produktname',
              value: product => product.name,
              width: 50
            })
            break;
          case "Preis":
            colArray.push({
              column: 'Preis',
              value: product => product.price,
              width: 50
            })
            break;
          case "Bestand":
            colArray.push({
              column: 'Bestand',
              value: product => product.stock_quantity,
              width: 50
            })
            break;
          case "Beschreibung":
            colArray.push({
              column: 'Beschreibung',
              value: product => product.description,
              width: 50
            })
            break;
          case "Kategorie":
            colArray.push({
              column: 'Kategorie',
              value: product => product.categories.map(category => category.name),
              width: 50
            })
            break;
          case "Schlagwörter":
            colArray.push({
              column: 'Schlagwörter',
              value: product => product.tags.map(tag => tag.name),
              width: 50
            })
            break;
          case "Bild":
            colArray.push({
              column: 'Bild',
              value: product => product.images.map(image => image.src),
              width: 50
            })
            break;
          case "EAN":
            colArray.push({
              column: 'EAN',
              value: product => product.ean_code,
              width: 50
            })
            break;
          case "Artikelnummer":
            colArray.push({
              column: 'Artikelnummer',
              value: product => product.sku,
              width: 50
            })
            break;
          case "Link":
            colArray.push({
              column: 'Link',
              value: product => product.permalink,
              width: 50
            })
            break;
        }
      }
      let data = []
      if(this.categorieFilter.length === 0 && this.tagFilter.length === 0 || this.stockFilter === "") {
        data = this.$store.state.products
      } else {
        data = this.$store.state.products
        for(let i = 0; i < data.length; i++) {
          if(this.categorieFilter.length !== 0) {
            let found = false
            for(let j = 0; j < this.categorieFilter.length; j++) {
              if(data[i].categories.map(category => category.name).includes(this.categorieFilter[j])) {
                found = true
              }
            }
            if(!found) {
              data.splice(i, 1)
              i--
            }
          }
          if(this.tagFilter.length !== 0) {
            let found = false
            for(let j = 0; j < this.tagFilter.length; j++) {
              if(data[i].tags.map(tag => tag.name).includes(this.tagFilter[j])) {
                found = true
              }
            }
            if(!found) {
              data.splice(i, 1)
              i--
            }
          }
          if(this.stockFilter !== "") {
            if(data[i].stock_quantity != undefined && data[i].stock_quantity < this.stockFilter) {
              data.splice(i, 1)
              i--
            }
          }
        }
      }
      exportCSV(data, colArray, this.filename)
    }
  }
}
</script>
