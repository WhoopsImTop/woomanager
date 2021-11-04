<template>
  <v-app dark>

    <v-dialog 
     persistent
     max-width="285px"
     dark 
     v-model="updateExists"
     >
      <v-card class="glass2">
        <v-card-title>
          <span class="headline">Update verfügbar!</span>
        </v-card-title>
        <v-card-text>
          <v-btn color="accent"> Update Installieren </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      dark
      v-model="settingDialog"
      max-width="600px"
    >
      <v-card 
      class="glass2"
      >
        <v-card-title>Einstellungen</v-card-title>
        <v-divider></v-divider>
          <v-container>
            <v-checkbox 
            v-for="(link, i) in links" :key="i"
            v-model="link.active">
              <template v-slot:label>
                <div>
                  {{ link.name }}
                </div>
              </template>
            </v-checkbox>
            <v-checkbox 
            v-model="workTimeRecording">
              <template v-slot:label>
                <div>
                  Zeiterfassung
                </div>
              </template>
            </v-checkbox>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="settingDialog=false">Schließen</v-btn>
            <v-btn text @click="SaveDialogSettings()">Speichern</v-btn>
          </v-card-actions>
          </v-card>
        </v-dialog>

    <v-app-bar class="top-bar" app>
      <v-toolbar-title><a style="color:#c3c3ce; text-decoration: none" :href="`https://` + getSiteName" target="_blank">{{ getSiteName }}</a></v-toolbar-title>
        <v-spacer></v-spacer>
          <v-chip
            v-show="workTimeRecording" 
            dark 
            class="glass2"
            >
            <v-icon small class="mr-4">mdi-clock-outline</v-icon>
            <span>{{ workTimePassed }}</span>
            <v-icon @click="startTimeRecording" small class="ml-4">{{ timeRecordingStatus }}</v-icon>
          </v-chip>
    </v-app-bar>

    <v-navigation-drawer
      class="pt-4 left-bar"
      permanent
    >
      <v-tooltip v-for="link, i in links" :key="i" right>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="px-2 mb-4 left-bar-btn"
          v-show="link.active == true"
          icon
          link
          dark
          v-bind="attrs"
          v-on="on"
          :to="link.to"
        >
          <v-img
            :src="link.icon"
          />
        </v-btn>
      </template>
      <span>{{ link.name }}</span>
    </v-tooltip>

      <template v-slot:append>
        <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="px-2 mb-4"
                icon
                link
                dark
                @click="settingDialog=true"
                v-bind="attrs"
                v-on="on"
              >
                <v-img
                  src="../public/static/settings.svg"
                />
              </v-btn>
            </template>
          <span>Einstellungen</span>
        </v-tooltip>
        
        <v-tooltip right>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="px-2 mb-4"
                icon
                link
                dark
                v-bind="attrs"
                v-on="on"
              >
                <v-img
                  src="../public/static/lock.svg"
                />
              </v-btn>
            </template>
          <span>Abmelden</span>
        </v-tooltip>
      </template>
    </v-navigation-drawer>

    <v-main class="content-container">
      <v-container v-if="secrets">
        <v-col
          cols="12"
        >
          <v-col
            cols="12"
            lg="6"
            sm="12"
            class="mx-auto text-center"
          >
            <h2
            class="mb-5"
            >Onlineshop verbinden</h2>
            <v-text-field
              v-model="shopURL"
              color="accent"
              outlined
              dark
              label="Webadresse deines Onlineshops"
              placeholder="https://"
            >
            </v-text-field>
            <v-text-field
              v-model="customerKey"
              color="accent"
              outlined
              dark
              label="Woocommerce Customer Key"
            >
            </v-text-field>
            <v-text-field
              v-model="customerSecret"
              color="accent"
              outlined
              dark
              type="password"
              label="Woocommerce Customer Secret"
            >
            </v-text-field>
            <v-row cols="12">
              <v-col cols="6">
                <v-btn
                  large
                  block
                  color="secondary"
                >
                  Einträge löschen
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  @click="CheckConnection()"
                  block
                  large
                  color="accent"
                  type="reset"
                  :loading="btnLoading"
                >
                  {{btnText}}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-col>
      </v-container>
      <router-view v-else>
      </router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data:() => {
    return {
      links: [
        {
          name: "Startseite",
          to: "/",
          icon: "./static/home.svg",
          active: true,
        }, 
        //{
        //  name: "Statistiken",
        //  to: "/stats",
        //  icon: "./static/analytics.svg",
        //  active: false,
        //}, 
        {
          name: "Bestellungen",
          to: "/orders",
          icon: "./static/receipt.svg",
          active: false,
        },
        {
          name: "Produkte",
          to: "/products",
          icon: "./static/inventory.svg",
          active: true,
        },
        {
          name: "Kategorien",
          to: "/categories",
          icon: "./static/category.svg",
          active: true,
        },
        {
          name: "Schlagwörter",
          to: "/tags",
          icon: "./static/tags.svg",
          active: true,
        },
        {
          name: "Scanner",
          to: "/scanner",
          icon: "./static/scan.svg",
          active: true,
        },
        {
          name: "Scan Liste",
          to: "/list",
          icon: "./static/list.svg",
          active: true,
        }
      ],
      workTimeRecording: false,
      settingDialog: false,
      timeRecording: false,
      customerKey: "",
      customerSecret: "",
      shopURL: "",
      btnLoading: false,
      btnText: "Onlineshop verbinden",
      startTime: null,
      endTime: null,
      totalTime: 0.00,
      refreshing: false,
      registration: null,
      updateExists: true,
    }
  },
  computed: {
    getSiteName() {
      return localStorage.getItem('shopURL') ? localStorage.getItem('shopURL').split('https://').join("") : "Kein Onlineshop verbunden"
    },
    secrets() {
      return localStorage.getItem('ck') ? false : true
    },
    timeRecordingStatus() {
      if(this.timeRecording) {
        return "mdi-pause"
      } else {
        return "mdi-play"
      }
    },
    workTimePassed() {
        return this.totalTime.toFixed(0);
    }
  },
  methods: {
    showRefreshUI (e) {
      this.registration = e.detail;
      this.updateExists = true;
    },
    refreshApp () {
      this.updateExists = false;
      if (!this.registration || !this.registration.waiting) { return; }
      this.registration.waiting.postMessage('skipWaiting');
    },
    startTimeRecording() {
      this.timeRecording = !this.timeRecording
      if(this.timeRecording){
        this.startTime = new Date()
        this.startTimer()
      } else {
        this.endTime = new Date()
        this.totalTime = this.endTime - this.startTime
      }
    },
    startTimer() {
      this.totalTime = (new Date() - this.startTime) / 1000
      if(this.timeRecording) {
        setTimeout(() => {
          this.startTimer()
        }, 1000)
      }
    },
    SaveDialogSettings() {
      localStorage.setItem('nav', JSON.stringify(this.links))
      this.settingDialog = false
    },
    async getData() {
      axios
      .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=1`)
      .then(res => {
        let page = res.headers["x-wp-totalpages"]
        for(let i = 1; i <= page - 1; i++) {
          axios
          .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=${i}`)
          .then(res => {
            for(let x = 0; x < res.data.length; x++) {
              this.$store.state.products.push(res.data[x])
              if(res.data[x].stock_quantity <= 0 && res.data[x].manage_stock == true && res.data[x].name != "") {
                this.$store.state.outOfStock.push(res.data[x])
              }
            }
          })
        }
      })
      .catch((e) => {
        console.log(e)
      })
      axios
      .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/categories/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=1`)
      .then(res => {
        let page = res.headers["x-wp-totalpages"]
        for(let i = 1; i <= page - 1; i++) {
          axios
          .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/categories/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=${i}`)
          .then(res => {
            for(let x = 0; x < res.data.length; x++) {
              this.$store.state.categories.push(res.data[x])
            }
          })
        }
      })
      .catch((e) => {
        console.log(e)
      })
      axios
      .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/tags/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=1`)
      .then(res => {
        let page = res.headers["x-wp-totalpages"]
        for(let i = 1; i <= page - 1; i++) {
          axios
          .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/products/tags/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}&per_page=100&page=${i}`)
          .then(res => {
            for(let x = 0; x < res.data.length; x++) {
              this.$store.state.tags.push(res.data[x])
            }
          })
        }
      })
      .catch((e) => {
        console.log(e)
      })
      axios
      .get(`${localStorage.getItem('shopURL')}/wp-json/wc/v3/orders/?consumer_key=${localStorage.getItem('ck')}&consumer_secret=${localStorage.getItem('cs')}`)
      .then(res => {
        this.$store.state.orders = res.data
      })
      .catch((e) => {
        console.log(e)
      })
    },
    CheckConnection() {
      this.btnLoading = true
      axios
      .get(`${this.shopURL}/wp-json/wc/v3/orders?consumer_key=${this.customerKey}&consumer_secret=${this.customerSecret}`)
      .then(res => {
        if(res.status == 200) {
          localStorage.setItem("ck", this.customerKey);
          localStorage.setItem("cs", this.customerSecret);
          localStorage.setItem("shopURL", this.shopURL);
          this.btnLoading = false
          this.btnText = "Erfolgreich verbunden"
          setTimeout(() => {
            this.btnText = "Onlineshop verbinden"
          }, 3000)
        }
      })
      .catch((e) => {
        this.btnLoading = false
        this.btnText = "Keine verbindung möglich"
        console.log(e)
      })
    }
  },
  created() {
    this.getData()
    if(localStorage.getItem('nav')) {
      this.links = JSON.parse(localStorage.getItem('nav'))
    }
    window.addEventListener('unload', () => {
      window.alert("Achtung du willst die Seite neu laden. Dann müssen alle Produkte wieder geladen werden")
    })
    this.refreshApp(),
    document.addEventListener(
    'swUpdated', this.showRefreshUI, { once: true }
    );
    if (navigator.serviceWorker) {  
      navigator.serviceWorker.addEventListener(
        'controllerchange', () => {
          if (this.refreshing) return;
          this.refreshing = true;
          window.location.reload();
          localStorage.removeItem('auth-token')
          localStorage.removeItem('UserID')
        }
      );
    }
  }
}
</script>

<style>
#app {
  font-family: 'Poppins', sans-serif;
  background-color: #171520;
  box-sizing: border-box;
}

.top-bar {
  position: fixed !important;
  top: 10px !important;
  left: 10px !important;
  width: calc(100vw - 40px) !important;
  height: 70px !important;
  border-radius: 5px !important;
  background: rgba( 66, 66, 87, 0.35 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important
}

.left-bar {
  position: fixed !important;
  top: 90px !important;
  left: 10px !important;
  height: calc(100vh - 110px) !important;
  width: 70px !important;
  border-radius: 5px !important;
  background: rgba( 66, 66, 87, 0.35 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
}

.btn {
  background: rgba( 66, 66, 87, 0.35 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
}

.glass {
  background: rgba( 66, 66, 87, 0.35 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #efefef !important;
  z-index: 0 !important;
}

.glass2 {
  background: rgba( 66, 66, 87, 0.8 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #efefef !important;
  z-index: 0 !important;
}

.btn-danger {
  background: rgba(158, 35, 64, 0.35) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
}

.content-container {
  overflow-y: scroll !important;
  position: fixed;
  right: 13px;
  top: 90px;
  left: 93px;
  border-radius: 5px !important;
  background: rgba( 66, 66, 87, 0.35 ) !important;
  backdrop-filter: blur( 9px ) !important;
  -webkit-backdrop-filter: blur( 9px ) !important;
  border-radius: 10px !important;
  border: 1px solid rgba( 255, 255, 255, 0.18 ) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
  height: calc(100vh - 110px);
}

.left-bar-btn:hover::after {
  content: "";
  position: absolute;
  left: 35%;
  right: 35%;
  bottom: -5px;
  border: 2px solid #FB7D00;
  transition: .3s ease-in-out;
  z-index: -200
}

.left-bar-btn {
  transition: .3s ease-in-out;
}
</style>
