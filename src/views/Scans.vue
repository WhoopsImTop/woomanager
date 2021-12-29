<template>
  <div>
    <v-dialog
      v-model="dialog"
      persistent
    >
      <v-card class="glass" dark>
        <v-card-title class="text-h5">
          Wollen Sie den Scan wirklich löschen?
        </v-card-title>
        <v-card-text>EAN: {{ selectedItem.EAN }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            text
            @click="dialog = false"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="red"
            text
            @click="removeItem()"
          >
            löschen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

      <h1 style="margin: 20px 0">Barcodescanner</h1>
      <v-row class="h-full">
          <v-col 
          cols="10"
          >
            <v-data-table
                dark
                :headers="headers"
                :items="scans"
                :items-per-page="itemsPerPage"
                :loading="loading"
                loading-text="Daten werden geaden"
                class="elevation-1 glass"
                >
                <template v-slot:top>
                    <div style="position: relative; display: flex; height: 50px; align-items: center">
                    <v-chip v-show="searchEANText != ''" class="glass" color="green">{{ searchEANText }}</v-chip>
                    </div>
                </template>
                
              <template v-slot:item.actions="{ item }">
                <v-icon
                    small
                    @click="removeProduct(item)"
                >
                    mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-col>
          <v-col
          cols="2"
          style="position: relative; display: flex; flex-direction: column; background-color:#efefef; text-align: center; color: #353535"
          >
              <h2>Verkauf</h2>
              <hr>
              <div style="overflow-y: scroll; height: 100%">
                  <div style="display: flex; justify-content: space-between; font-family: monospace;" v-for="(item, i) in foundScans" :key="i">
                  <span style="text-overflow: ellipsis; white-space: nowrap; max-width: 200px; overflow: hidden; ">{{ item.name }}</span>
                  <span>{{ item.price }}</span>
                  </div>
              </div>
              <div style="position: absolute; bottom: 10px;width: 90%; z-index: 10; background-color: #efefef">
              <hr>
                <span style="font-family: monospace">Gesamt: {{ countPrices }}€</span>
              </div>
          </v-col>
      </v-row>
  </div>
</template>

<script>
import onScan from 'onscan.js'
import axios from 'axios'
import timestamp from 'time-stamp'
import guidGenerator from '../helpers/uid'
export default {
    data:() => {
        return {
            productsUrl: 'https://bindis-schaulaedle.de/wp-json/wc/v3/products?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc',
            headers: [
                { text: "EAN", align: "start", sortable: false, value: "EAN"},
                { text: "Status", sortable: false, value: "Status"},
                { text: "Zeitstempel", sortable: true, value: "TimeStamp"},
                { text: "Funktionen", align: "end", sortable: false, value: 'actions'},
            ],
            scans: [],
            itemsPerPage: 10,
            loading: false,
            suche: '',
            searchParam: '',
            foundScans: [],
            searchEANText: '',
            dialog: false,
            selectedItem: [],
            ScannedList: []
        }
    },
    computed: {
        countPrices() {
            let price = 0
            for(let i = 0; i < this.foundScans.length; i++) {
                if(this.foundScans[i].price != "" && this.foundScans[i].price != null && this.foundScans[i].price != undefined) {
                    price += JSON.parse(this.foundScans[i].price)
                }
            }
            return price
        }
    },
    methods: {
        async init() {
            try{
                onScan.attachTo(document);
            }
            catch(e) {
                console.log(e)
            }
            // Register event listener
            document.addEventListener('scan', async(e) => {
                let Search = e.detail.scanCode;

                let index = this.$store.state.products.findIndex(x => x.ean_code === Search);
                if(Search != '') {
                    if(index != -1) {
                        this.searchEANText = 'Produkt gefunden'
                        this.scans.push({
                            "Id": this.$store.state.products[index].id,
                            "EAN": Search,
                            "Status": "gefunden",
                            "TimeStamp": timestamp('DD.MM HH:mm:ss')
                        })
                        this.foundScans.push(this.$store.state.products[index])
                        this.ReduceProduct(this.$store.state.products[index].id, this.$store.state.products[index].stock_quantity)
                    } else {
                        this.searchEANText = 'Produkt nicht gefunden'
                        let check = await this.serverProductChecker(Search);
                        if(!check) {
                        this.scans.push({
                            "Id": guidGenerator(),
                            "EAN": Search,
                            "Status": "Nicht gefunden",
                            "TimeStamp": timestamp('DD.MM HH:mm:ss')
                        })
                        this.SaveItem(Search, "nicht gefunden")
                        }
                    }
                }
                setTimeout(() => {
                    this.searchEANText = ''
                }, 1000)
            });
        },
        async serverProductChecker(id) {
            let data = await axios
            .get(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc&search=${id}`)
            .then(response => {
                return response.data
            })
            if(data.length === 1) {
                    this.foundScans.push(data[0])
                    this.scans.push({
                        "Id": data[0].id,
                        "EAN": data[0].ean_code,
                        "Status": "gefunden",
                        "TimeStamp": timestamp('DD.MM HH:mm:ss')
                    })
                    this.$store.state.products.push(data[0])
                    this.ReduceProduct(data[0].id, data[0].stock_quantity)
                    return true
                } else {
                    return false
                }
        },
        SaveItem(ean, status) {
            axios
            .post('https://bindis.rezept-zettel.de/api/scans', {
                "EAN": ean,
                "Status": status,
                "TimeStamp": timestamp('DD.MM. HH:mm:ss')
            })
            .catch((e) => {
                console.log(e)
            })
        },
        removeItem() {
            let table = this.scans
            if(this.selectedItem.Status === "gefunden") {
                this.CountUpProduct(this.selectedItem.Id)
            }
            this.scannedArticles--
            var outputArray = []
            let foundCount = 0
            const searchValue = this.selectedItem.Id
            for(let i = 0; i < table.length; i++) {
                if(table[i].Id===searchValue && foundCount===0)
                {
                    foundCount++
                } else {
                    outputArray.push(table[i])
                }
            }
            this.scans = outputArray
            this.SelectSearch()
            this.dialog = false
        },
        removeProduct(item) {
            this.selectedItem = item;
            this.dialog = true;
        },
        ReduceProduct: function(id, stock_quantity) {
            let newStock = stock_quantity - 1
             axios
            .post('https://bindis-schaulaedle.de/wp-json/wc/v3/products/' + id + '?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc', {
                stock_quantity: newStock
            })
        },
        CountUpProduct: function(ID) {
            axios
            .get('https://bindis-schaulaedle.de/wp-json/wc/v3/products/' + ID + '?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc')
            .then(response => {
                let res = response.data.stock_quantity
                let NewStock = res + 1
                axios
                .post('https://bindis-schaulaedle.de/wp-json/wc/v3/products/' + ID + '?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc', {
                    stock_quantity: NewStock
                }).then(response => {
                    console.log(response)
                })
                .catch((e) => {
                    console.log(e)
                })
            })
        },
    },
    created() {
        this.init();
    }
}
</script>

<style>

</style>