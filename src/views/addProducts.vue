<template>
  <div>
    <h1 style="margin: 20px 0">Bitte Aufnehmen</h1>
    <v-list
        v-if="ScannedList.length > 0"
        class="glass"
        nav
        dense
      >
        <v-list-item-group
          class="my-5"
          v-model="selectedItem"
          color="primary"
        >
          <v-list-item
            dark
            class="glass2"
            v-for="item in ScannedList"
            :key="item._id"
          >
            <v-list-item-content>
              <v-row>
                <v-col>
                  <v-list-item-title v-text="item.EAN"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.TimeStamp"></v-list-item-subtitle>
                </v-col>
                <v-col>
                  <v-list-item-subtitle>{{item.Anzahl}} x gescannt</v-list-item-subtitle>
                </v-col>
              </v-row>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                @click="removeItem(item._id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-card
        v-else
        dark
        class="glass"
      >
        <v-card-title>Du hast bis jetzt keine Artikel gescannt</v-card-title>
          <v-divider></v-divider>
        <v-card-text>
          <span>Jetzt einfach Produkte Scannen, die du als <i>"Bitte Aufnehmen"</i> speichern willst.</span>
        </v-card-text>
      </v-card>
  </div>
</template>

<script>
import onScan from 'onscan.js'
import axios from 'axios'
import timestamp from 'time-stamp'

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
            loading: false,
            foundScans: [],
            searchEANText: '',
            selectedItem: [],
            ScannedList: [],
            FailedScanList: [],
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
            document.addEventListener('scan', async(e) => {
                let Search = e.detail.scanCode;
                axios
                .post('https://bindis.rezept-zettel.de/api/scans', {
                    "EAN": Search,
                    "Status": "Bitte Aufnehmen",
                    "TimeStamp": timestamp('DD.MM HH:mm:ss')
                })
                .then(response => {
                  if(response.data.EAN != undefined) {
                    this.addToList(response.data)
                  } else {
                    axios
                    .get('https://bindis.rezept-zettel.de/api/scans/' + Search)
                    .then(response => {
                        this.addToList(response.data)
                    })
                  }
                })
                .catch(error => {
                    console.log(error)
                    this.FailedScanList.push({
                      "EAN": Search,
                      "Status": "Bitte Aufnehmen",
                      "TimeStamp": timestamp('DD.MM HH:mm:ss')
                    })
                    localStorage.setItem('FailedScanList', JSON.stringify(this.FailedScanList))
                })
            });
        },
        addToList(data) {
          //check if item is already in list
          let found = this.ScannedList.find(item => item.EAN == data.EAN)
          if(found == undefined) {
            this.ScannedList.push(data)
          } else {
            found.Anzahl += 1
          }
        },
        reUploadItem() {
          //upload failed scans
          let FailedScanList = JSON.parse(localStorage.getItem('FailedScanList'))
          if(FailedScanList) {
            FailedScanList.forEach(item => {
              axios
              .post('https://bindis.rezept-zettel.de/api/scans', {
                  "EAN": item.EAN,
                  "Status": "Bitte Aufnehmen",
                  "TimeStamp": timestamp('DD.MM HH:mm:ss')
              })
              .then(response => {
                if(response.data.includes(item.EAN)) {
                    this.addToList(response.data)
                    this.FailedScanList.splice(FailedScanList.indexOf(item), 1)
                } else {
                  axios
                  .get('https://bindis.rezept-zettel.de/api/scans/' + item.EAN)
                  .then(response => {
                      this.addToList(response.data)
                      this.FailedScanList.splice(FailedScanList.indexOf(item), 1)
                  })
                }
              })
            })
          }
          localStorage.setItem('FailedScanList', JSON.stringify(this.FailedScanList))
        },
        async removeItem(id) {
          axios
          .delete(`https://bindis.rezept-zettel.de/api/scans/${id}`)
          .then(() => {
            this.ScannedList.splice(this.ScannedList.indexOf(id), 1);
        })
      },
    },
    created() {
        this.init();
        this.FailedScanList = JSON.parse(localStorage.getItem('FailedScanList'))
    },
    beforeDestroy() {
        onScan.detachFrom(document);
    },
}
</script>

<style>

</style>