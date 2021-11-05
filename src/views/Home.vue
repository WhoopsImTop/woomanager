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
      stockFilter: null,
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
      console.log(this.categorieFilter.length, " ", this.tagFilter.length, " ", this.stockFilter)
      if(this.categorieFilter.length === 0 && this.tagFilter.length === 0 && this.stockFilter === "") {
        data = this.$store.state.products
      } else {
        if(this.categorieFilter.length !== 0) {
          for(let x = 0; x < this.$store.state.products.length; x++) {
            for(let k = 0; k < this.categorieFilter.length; k++) {
              for(let i = 0; i < this.$store.state.products[x].categories.length; i++) {
                if(this.$store.state.products[x].categories[i].name === this.categorieFilter[k].name) {
                    data.push(this.$store.state.products[x])
                  }
                }
              }
            }
          }
        }
        if(data.length !== 0) {
          if(this.tagFilter.length !== 0) {
            for(let x = 0; x < data.length; x++) {
              for(let k = 0; k < this.tagFilter.length; k++) {
                for(let i = 0; i < data[x].tags.length; i++) {
                  if(data[x].tags[i].name === this.tagFilter[k].name)
                  data.splice(x, 0)
                }
              }
            }
          }
        } else {
          for(let x = 0; x < this.$store.state.products.length; x++) {
          if(this.tagFilter.length !== 0) {
            for(let k = 0; k < this.tagFilter.length; k++) {
              for(let i = 0; i < this.$store.state.products[x].tags.length; i++) {
                if(this.$store.state.products[x].tags[i].name === this.tagFilter[k].name) {
                  data.push(this.$store.state.products[x])
                  }
                }
              }
            }
          }
        }
        if(data.length !== 0) {
          if(this.stockFilter != null) {
            for(let x = 0; x < data.length; x++) {
              if(data[x].stock_quantity >= this.stockFilter) {
                data.splice(x, 0)
              }
            }
          } 
        } else {
          if(this.stockFilter != null) {
            for(let x = 0; x < this.$store.state.products.length; x++) {
              if(data[x].stock_quantity <= this.stock_quantity) {
                data.push(this.$store.state.products[x])
              }
            }
          }
        }
      exportCSV(data, colArray, this.filename)
    }
  }
}
</script>
