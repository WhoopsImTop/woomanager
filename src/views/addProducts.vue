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
              <v-list-item-title v-text="item.EAN"></v-list-item-title>
              <v-list-item-subtitle v-text="item.TimeStamp"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                @click="removeItem(i)"
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
            FailedScanList: []
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
                  if(response.data.includes(Search)) {
                    this.ScannedList.push({
                        "id": response.data._id,
                        "EAN": response.data.EAN,
                        "Status": "Bitte Aufnehmen",
                        "TimeStamp": timestamp('DD.MM HH:mm:ss')
                    })
                  } else {
                    axios
                    .get('https://bindis.rezept-zettel.de/api/scans/' + Search)
                    .then(response => {
                        this.ScannedList.push({
                            "id": response.data._id,
                            "EAN": response.data.EAN,
                            "Status": "Bitte Aufnehmen",
                            "TimeStamp": timestamp('DD.MM HH:mm:ss')
                        })
                    })
                  }
                })
                .catch(() => {
                    this.FailedScanList.push({
                        "EAN": Search,
                        "Status": "Bitte Aufnehmen",
                        "TimeStamp": timestamp('DD.MM HH:mm:ss')
                    })
                    localStorage.setItem('FailedScanList', JSON.stringify(this.FailedScanList))
                })
            });
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
                  this.ScannedList.push({
                      "id": response.data._id,
                      "EAN": response.data.EAN,
                      "Status": "Bitte Aufnehmen",
                      "TimeStamp": timestamp('DD.MM HH:mm:ss')
                  })
                    this.FailedScanList.splice(FailedScanList.indexOf(item), 1)
                } else {
                  axios
                  .get('https://bindis.rezept-zettel.de/api/scans/' + item.EAN)
                  .then(response => {
                      this.ScannedList.push({
                          "id": response.data._id,
                          "EAN": response.data.EAN,
                          "Status": "Bitte Aufnehmen",
                          "TimeStamp": timestamp('DD.MM HH:mm:ss')
                      })
                      this.FailedScanList.splice(FailedScanList.indexOf(item), 1)
                  })
                }
              })
            })
          }
          localStorage.setItem('FailedScanList', JSON.stringify(this.FailedScanList))
        },
        async removeItem(id) {
          let item = this.ScannedList.find(item => item.id === id);
          axios
          .delete(`https://bindis.rezept-zettel.de/api/scans/${item.id}`)
          .then(() => {
            this.ScannedList.splice(this.ScannedList.indexOf(item), 1);
        })
      },
    },
    created() {
        this.FailedScanList = JSON.parse(localStorage.getItem('FailedScanList'))
        this.init();
    }
}
</script>

<style>

</style>