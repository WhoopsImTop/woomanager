<template>
  <v-app dark>
    <v-app-bar class="top-bar" app>
      <v-toolbar-title><a style="color:#c3c3ce; text-decoration: none" :href="`https://` + getSiteName" target="_blank">{{ getSiteName }}</a></v-toolbar-title>
        <v-spacer></v-spacer>
          <v-avatar
            color="gray"
            size="36"
          ></v-avatar>
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
          name: "Statistiken",
          to: "/stats",
          icon: "./static/analytics.svg",
          active: false,
        }, 
        {
          name: "Bestellungen",
          to: "/orders",
          icon: "./static/receipt.svg",
          active: true,
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
          name: "Scan Liste",
          to: "/scans",
          icon: "./static/list.svg",
          active: false,
        },
        {
          name: "Scanner",
          to: "/scanner",
          icon: "./static/scan.svg",
          active: true,
        }
      ],
      customerKey: "",
      customerSecret: "",
      shopURL: "",
      btnLoading: false,
      btnText: "Onlineshop verbinden"
    }
  },
  computed: {
    getSiteName() {
      return localStorage.getItem('shopURL') ? localStorage.getItem('shopURL').split('https://').join("") : "Kein Onlineshop verbunden"
    },
    secrets() {
      return localStorage.getItem('ck') ? false : true
    }
  },
  methods: {
    CheckConnection() {
      this.btnLoading = true
      axios
      .get(`${this.shopURL}/wp-json/wc/v3/orders?consumer_key=${this.customerKey}&consumer_secret=${this.customerSecret}`)
      .then(res => {
        if(res.status == 200) {
          localStorage.setItem("ck", this.customerKey);
          localStorage.setItem('cs', this.customerSecret);
          localStorage.setItem("shopURL", this.shopURL);
          this.btnLoading = false
          this.btnText = "Erfolgreich verbunden"
          setTimeout(() => {
            this.btnText = "Onlineshop verbinden"
          }, 3000)
        }
      })
      .catch((e) => {
        this.btnText = "Keine verbindung möglich"
        console.log(e)
      })
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

.content-container {
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
