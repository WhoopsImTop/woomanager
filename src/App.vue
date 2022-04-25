<template>
  <v-app dark>
    <v-dialog persistent max-width="500" v-model="loading">
      <v-card dark class="glass2">
        <v-card-title> Produkte werden geladen </v-card-title>
        <v-divider class="mb-7"></v-divider>
        <v-card-text>
          <v-progress-linear indeterminate color="orange"></v-progress-linear>
          <div v-if="!error">
            {{ loadedProducts }} von {{ maxProducts }} Produkten geladen.
          </div>
          <div v-else>
            Beim laden der Produkte is ein Fehler aufgetreten. Bitte wähle unten
            eine Aktion aus.
          </div>
        </v-card-text>
        <v-divider v-show="error"></v-divider>
        <v-card-actions v-show="error">
          <v-btn text color="red" @click="error = false, loading = false">
            >Trotzdem arbeiten</v-btn
          >
          <v-btn color="success" @click="window.location.reload()"
            >Nochmal versuchen</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog persistent max-width="500" dark v-model="offline">
      <v-card class="glass" dark>
        <v-card-title> Du hast die Internetverbindung verloren </v-card-title>
        <v-divider class="mb-4"></v-divider>
        <v-card-text>
          Bitte stelle sicher, dass du mit dem Internet verbunden bist.
          <v-spacer class="my-5"></v-spacer>
          <v-progress-linear
            indeterminate
            color="red"
            class="mb-0"
          ></v-progress-linear>
          <span>Das Popup verschwindet wenn du wieder verbunden bist</span>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog persistent max-width="285px" dark v-model="showUpdateUI">
      <v-card class="glass2">
        <v-card-title>
          <span class="headline">Update verfügbar!</span>
        </v-card-title>
        <v-card-text>
          <v-btn color="accent" @click="accept"> Update Installieren </v-btn>
          <span>oder STRG + SHIFT + R</span>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog dark v-model="settingDialog" max-width="600px">
      <v-card class="glass2">
        <v-card-title>Einstellungen</v-card-title>
        <v-divider></v-divider>
        <v-container>
          <v-checkbox v-for="(link, i) in links" :key="i" v-model="link.active">
            <template v-slot:label>
              <div>
                {{ link.name }}
              </div>
            </template>
          </v-checkbox>
        </v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="settingDialog = false">Schließen</v-btn>
          <v-btn text @click="SaveDialogSettings()">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-app-bar 
    class="top-bar" 
    app
      >
      <v-toolbar-title
        ><a
          style="color: #c3c3ce; text-decoration: none"
          :href="`https://` + getSiteName"
          target="_blank"
          >{{ getSiteName }}</a
        ></v-toolbar-title
      >
      <v-spacer></v-spacer>
      <v-menu      
      v-show="workTimeActive == true"
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="200"
      offset-x
      >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-show="workTimeActive == true"
          outlined
          text
          dark
          v-bind="attrs"
          v-on="on"
        >
        <v-icon
          dark
          small
          class="mr-2"
        >
          mdi-clock-outline
        </v-icon>
          Arbeitszeit
        </v-btn>
      </template>

      <v-card dark class="glass2">
        <v-list style="background-color: unset !important">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title> {{ UserName }} </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list style="background-color: unset !important">
          <v-list-item v-show="eingestempelt">
            <v-list-item-title class="text-center"> {{ hours }} Stunde {{ minutes }} Minuten </v-list-item-title>
          </v-list-item>

          <v-list-item v-show="!eingestempelt">
            <v-btn 
            text
            outlined
            dark
            block
            @click="checkIn()"
            >Einstempeln</v-btn>
          </v-list-item>
          <v-list-item v-show="eingestempelt">
            <v-btn 
            text
            outlined
            dark
            block
            @click="checkOut()"
            >Ausstempeln</v-btn>
          </v-list-item>
        </v-list>
      </v-card>
      </v-menu>

      <div>
        <v-tooltip
          bottom
          v-for="user in $store.state.users"
          :key="user.id"
          v-show="$store.state.users.length > 0"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-chip
              class="mx-2"
              dark
              label
              v-bind="attrs"
              v-on="on"
              color="success"
            >
              <v-icon small class="mr-4">mdi-account</v-icon>
              <span>{{ user.name }}</span>
            </v-chip>
          </template>
          <span>{{ wichPath(user.url) }}</span>
        </v-tooltip>

        <v-btn icon dark @click="showLatestEdited = !showLatestEdited">
          <v-icon> mdi-history </v-icon>
        </v-btn>
      </div>

      <v-dialog v-model="showLatestEdited" max-width="600px" dark>
        <v-card class="glass2">
          <v-card-title>
            <span class="headline">Von dir zuletzt Bearbeitet</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list class="glass mt-3">
              <v-list-item
                dark
                v-for="item in $store.state.latestEdited"
                :key="item.id"
              >
                <v-list-item-avatar>
                  <v-img
                    v-if="item.images[0]"
                    :src="item.images[0].src"
                    class="avatar"
                  ></v-img>
                  <v-img
                    v-else
                    src="../public/img/placeholder.png"
                    class="avatar"
                  ></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ item.name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.price }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <span
                  >Bearbeitet <br />
                  am {{ FormatItemDate(item.edited_at) }}</span
                >
                <v-spacer></v-spacer>
                <v-chip label :color="getItemMethod(item.method).color"
                  >{{ getItemMethod(item.method).method }}
                </v-chip>
                <v-list-item-action>
                  <v-btn
                    icon
                    dark
                    :loading="item.loading"
                    @click="undoAction(item)"
                  >
                    <v-icon>mdi-undo</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="red" text @click="RemoveLastEditedList()"
              >Liste löschen</v-btn
            >
            <v-spacer></v-spacer>
            <v-btn text @click="showLatestEdited = false">Schließen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>

    <v-navigation-drawer class="pt-4 left-bar" permanent>
      <v-tooltip v-for="(link, i) in links" :key="i" right>
        <template v-slot:activator="{ on, attrs }">
          <v-badge
            v-if="link.badge"
            color="accent"
            dot
            :content="orders.length"
          >
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
              <v-img :src="link.icon" />
            </v-btn>
          </v-badge>
          <div v-else>
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
              <v-img :src="link.icon" />
            </v-btn>
          </div>
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
              @click="settingDialog = true"
              v-bind="attrs"
              v-on="on"
            >
              <v-img src="../public/static/settings.svg" />
            </v-btn>
          </template>
          <span>Einstellungen</span>
        </v-tooltip>

        <v-tooltip right>
          <template v-slot:activator="{ on, attrs }">
            <v-btn class="px-2 mb-4" icon link dark v-bind="attrs" v-on="on">
              <v-img src="../public/static/lock.svg" />
            </v-btn>
          </template>
          <span>Abmelden</span>
        </v-tooltip>
      </template>
    </v-navigation-drawer>

    <v-main class="content-container">
      <v-container v-if="secrets">
        <v-col cols="12">
          <v-col cols="12" lg="6" sm="12" class="mx-auto text-center">
            <h2 class="mb-5">Onlineshop verbinden</h2>
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
                <v-btn large block color="secondary"> Einträge löschen </v-btn>
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
                  {{ btnText }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-col>
      </v-container>
      <router-view v-else> </router-view>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import io from "socket.io-client";
import productClass from './classes/productClass.js';

export default {
  data: () => {
    return {
      fav: true,
      menu: false,
      message: false,
      hints: true,
      hours: 0,
      minutes: 0,
      eingestempelt: false,
      startTime: null,
      timeEntryID: null,
      CheckIn: null,
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
          name: "Bitte Aufnehmen",
          to: "/add",
          icon: "./static/add.svg",
          active: true,
        },
        {
          name: "Scan Liste",
          to: "/list",
          icon: "./static/list.svg",
          active: true,
        },
        {
          name: "Arbeitszeit",
          to: "/workTime",
          icon: "./static/clock.svg",
          active: false,
        },
        {
          name: "Produkte schnell bearbeiten",
          to: "/fastEdit",
          icon: "./static/edit.svg",
          active: true,
        }
      ],
      settingDialog: false,
      customerKey: "",
      customerSecret: "",
      shopURL: "",
      btnLoading: false,
      btnText: "Onlineshop verbinden",
      refreshing: false,
      registration: null,
      showUpdateUI: false,
      orders: [],
      showLatestEdited: false,
      loading: false,
      maxProducts: 0,
      loadedProducts: 0,
      offline: false,
      error: false,
      UserName: "",
    };
  },
  computed: {
    workTimeActive() {
      let index = this.links.findIndex((link) => link.name == "Arbeitszeit");
      return this.links[index].active;
    },
    getSiteName() {
      return localStorage.getItem("shopURL")
        ? localStorage.getItem("shopURL").split("https://").join("")
        : "Kein Onlineshop verbunden";
    },
    secrets() {
      return localStorage.getItem("ck") ? false : true;
    },
  },
  methods: {
    checkIn() {
      this.eingestempelt = true;
      this.$store.state.socket.emit("checkIn", {
        user: localStorage.getItem("workTimeUser"),
        url: this.$store.state.shopURL,
        workTimeId: localStorage.getItem("workTimeUser"),
      });
      this.$store.state.socket.on("checkIn", (data) => {
        this.timeEntryID = data._id
      });
      this.$store.state.startTime = new Date();
      this.startTimer();
    },
    checkOut() {
      this.eingestempelt = false;
      this.$store.state.socket.emit("checkOut", {
        _id: this.CheckIn._id,
      });
      this.$store.state.endTime = new Date();
    },
    startTimer() {
      //calculate time
      let now = new Date();
      let diff = now - this.$store.state.startTime;
      this.hours = Math.floor(diff / 1000 / 60 / 60);
      this.minutes = Math.floor(diff / 1000 / 60) % 60;
      setTimeout(() => {
        if(this.eingestempelt) {
          this.startTimer();
        }
      }, 1000);
    },
    RemoveLastEditedList() {
      try {
        localStorage.removeItem("latestEdited");
        this.$store.state.latestEdited = [];
      } catch (e) {
        console.log(e);
      }
    },
    undoAction(item) {
      switch (item.method) {
        case "Delete":
          this.restoreProduct(item);
          break;
        case "Patch":
          this.undoPatch(item);
          break;
      }
    },
    restoreProduct(item) {
      let index = this.$store.state.latestEdited.indexOf(item);
      this.$store.state.latestEdited[index].loading = true;
      axios
        .post(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`,
          {
            name: item.name,
            price: item.price,
            regular_price: item.regular_price,
            description: item.description,
            short_description: item.short_description,
            categories: item.categories,
            tags: item.tags,
            images: item.images,
            attributes: item.attributes,
            sku: item.sku,
            stock_quantity: item.stock_quantity,
            stock_status: item.stock_status,
            ean_code: item.ean_code,
            meta_data: item.meta_data,
            status: "draft",
          }
        )
        .then((response) => {
          this.$store.state.products.unshift(response.data);
          this.$store.state.latestEdited[index].loading = false;
        })
        .catch((error) => {
          console.log(error);
          this.$store.state.latestEdited[index].loading = false;
        });
    },
    undoPatch(item) {
      let index = this.$store.state.latestEdited.indexOf(item);
      this.$store.state.latestEdited[index].loading = true;
      axios
        .patch(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/${item.id}/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`,
          item
        )
        .then((response) => {
          this.$store.state.products[item] = response.data;
          this.$store.state.latestEdited[index].loading = false;
        })
        .catch((error) => {
          console.log(error);
          this.$store.state.latestEdited[index].loading = false;
        });
    },
    getItemMethod(item) {
      if (item == "Patch") {
        return {
          method: "Bearbeitet",
          color: "#417B5A",
        };
      } else if (item == "Post") {
        return {
          method: "Neu Hinzugefügt",
          color: "#6987C9",
        };
      } else if (item == "Delete") {
        return {
          method: "gelöscht",
          color: "#EA526F",
        };
      } else if (item == "Duplikat") {
        return {
          method: "Duplikat",
          color: "#FF8A5B",
        };
      }
    },
    FormatItemDate(item) {
      let newDate = new Date(item);
      return (
        newDate.getDate() +
        "." +
        (newDate.getMonth() + 1) +
        "." +
        newDate.getFullYear()
      );
    },
    getFromLocalStorage() {
      this.$store.state.latestEdited = localStorage.getItem("latestEdited")
        ? JSON.parse(localStorage.getItem("latestEdited"))
        : [];
    },
    async accept() {
      this.showUpdateUI = false;
      await this.$workbox.messageSW({ type: "SKIP_WAITING" });
    },
    SaveDialogSettings() {
      localStorage.setItem("nav", JSON.stringify(this.links));
      this.settingDialog = false;
    },
    getData() {
      this.loading = true;
      axios
        .get(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}&per_page=100&page=1`
        )
        .then((res) => {
          this.maxProducts = res.headers["x-wp-total"];
          let page = res.headers["x-wp-totalpages"];
          for (let i = 1; i <= page; i++) {
            axios
              .get(
                `${localStorage.getItem(
                  "shopURL"
                )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
                  "ck"
                )}&consumer_secret=${localStorage.getItem(
                  "cs"
                )}&per_page=100&page=${i}`
              )
              .then((res) => {
                for (let x = 0; x < res.data.length; x++) {
                  this.loadedProducts++;
                  if (res.data[x].name != "") {
                    this.$store.state.products.push(new productClass(res.data[x]));
                  }
                  if (
                    res.data[x].stock_quantity <= 0 &&
                    res.data[x].manage_stock == true &&
                    res.data[x].name != ""
                  ) {
                    this.$store.state.outOfStock.push(res.data[x]);
                  }
                  if (
                    this.loadedProducts == this.maxProducts &&
                    this.loadedProducts != 0 &&
                    this.maxProducts != 0
                  ) {
                    this.loading = false;
                  }
                }
              });
          }
        })
        .catch((e) => {
          this.error = true;
          console.log(e);
        });
      axios
        .get(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/categories/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}&per_page=100&page=1`
        )
        .then((res) => {
          let page = res.headers["x-wp-totalpages"];
          for (let i = 1; i <= page - 1; i++) {
            axios
              .get(
                `${localStorage.getItem(
                  "shopURL"
                )}/wp-json/wc/v3/products/categories/?consumer_key=${localStorage.getItem(
                  "ck"
                )}&consumer_secret=${localStorage.getItem(
                  "cs"
                )}&per_page=100&page=${i}`
              )
              .then((res) => {
                for (let x = 0; x < res.data.length; x++) {
                  this.$store.state.categories.push(res.data[x]);
                }
              });
          }
        })
        .catch((e) => {
          this.error = true;
          console.log(e);
        });
      axios
        .get(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/tags/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}&per_page=100&page=1`
        )
        .then((res) => {
          let page = res.headers["x-wp-totalpages"];
          for (let i = 1; i <= page - 1; i++) {
            axios
              .get(
                `${localStorage.getItem(
                  "shopURL"
                )}/wp-json/wc/v3/products/tags/?consumer_key=${localStorage.getItem(
                  "ck"
                )}&consumer_secret=${localStorage.getItem(
                  "cs"
                )}&per_page=100&page=${i}`
              )
              .then((res) => {
                for (let x = 0; x < res.data.length; x++) {
                  this.$store.state.tags.push(res.data[x]);
                }
              });
          }
        })
        .catch((e) => {
          this.error = true;
          console.log(e);
        });
      axios
        .get("https://bindis.rezept-zettel.de/api/token")
        .then((res) => {
          this.$store.state.imageToken = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
      this.getOrders();
    },
    getOrders() {
      axios
        .get(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/orders/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`
        )
        .then((res) => {
          this.$store.state.orders = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
      setTimeout(() => {
        this.getOrders();
      }, 1000 * 60 * 5);
    },
    wichPath(path) {
      switch (path) {
        case "/":
          return "home";
        case "/orders":
          return "Bestellungen";
        case "/products":
          return "Produkte";
        case "/categories":
          return "Kategorien";
        case "/tags":
          return "Tags";
        case "/scanner":
          return "Verkauf";
        case "/add":
          return "Bitte Aufnehmen";
        case "/list":
          return "Tagesliste";
        case "/fastEdit":
          return "Schnelle Produktbearbeitung";
      }
    },
    CheckConnection() {
      this.btnLoading = true;
      axios
        .get(
          `${this.shopURL}/wp-json/wc/v3/orders?consumer_key=${this.customerKey}&consumer_secret=${this.customerSecret}`
        )
        .then((res) => {
          if (res.status == 200) {
            localStorage.setItem("ck", this.customerKey);
            localStorage.setItem("cs", this.customerSecret);
            localStorage.setItem("shopURL", this.shopURL);
            this.btnLoading = false;
            this.btnText = "Erfolgreich verbunden";
            window.loaction.reload();
            setTimeout(() => {
              this.btnText = "Onlineshop verbinden";
            }, 3000);
          }
        })
        .catch((e) => {
          this.btnLoading = false;
          this.btnText = "Keine verbindung möglich";
          console.log(e);
        });
    },
  },
  watch: {
    $route(to, from) {
      this.$store.state.socket.emit("urlChange", to.path);
      from;
    },
  },
  created() {
    this.UserName = localStorage.getItem("userName");
    this.$store.state.startTime = new Date().toTimeString().split(" ")[0];
    this.$store.state.socket = io("https://bindis.rezept-zettel.de");
    this.$store.state.socket.on("connect", () =>
      this.$store.state.socket.emit("hello", {
        name: localStorage.getItem("userName") || "Geschäft",        
        workTimeId: localStorage.getItem("workTimeUser"),
        url: this.$route.path,
      })
    );

    this.$store.state.socket.on("checkIn", (data) => {
      this.CheckIn = data
    });

    this.$store.state.socket.on("initialTodoLoad", (Todos) => {
      console.log(Todos);
    });

    this.$store.state.socket.on("currentUsers", (data) => {
      this.$store.state.users = data;
    });

    this.$store.state.socket.on("removeUser", (data) => {
      this.$store.state.users = data;
    });

    this.getData();
    this.getFromLocalStorage();
    if (localStorage.getItem("nav")) {
      let savedNav = JSON.parse(localStorage.getItem("nav"));
      for (let i = 0; i < savedNav.length; i++) {
        this.links[i].active = savedNav[i].active;
      }
    }
    setInterval(() => {
      if (navigator.onLine) {
        this.offline = false;
      } else {
        this.offline = true;
      }
    }, 200);
    if (this.$workbox) {
      this.$workbox.addEventListener("waiting", () => {
        this.showUpdateUI = true;
      });
    }
  },
};
</script>

<style>
#app {
  font-family: "Poppins", sans-serif;
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
  background: rgba(66, 66, 87, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
}

.left-bar {
  position: fixed !important;
  top: 90px !important;
  left: 10px !important;
  height: calc(100vh - 110px) !important;
  width: 70px !important;
  border-radius: 5px !important;
  background: rgba(66, 66, 87, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
}

.btn {
  background: rgba(66, 66, 87, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  padding: 0px 15px !important;
  color: #c3c3ce !important;
  z-index: 0 !important;
}

.glass {
  background: rgba(66, 66, 87, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  padding: 0px 15px !important;
  color: #efefef !important;
  z-index: 0 !important;
}

.glass2 {
  background: rgba(66, 66, 87, 0.8) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  padding: 0px 15px !important;
  color: #efefef !important;
  z-index: 0 !important;
}

.btn-danger {
  background: rgba(158, 35, 64, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
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
  background: rgba(66, 66, 87, 0.35) !important;
  backdrop-filter: blur(9px) !important;
  -webkit-backdrop-filter: blur(9px) !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
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
  border: 2px solid #fb7d00;
  transition: 0.3s ease-in-out;
  z-index: -200;
}

.left-bar-btn {
  transition: 0.3s ease-in-out;
}

.overlay-container {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  bottom: 0px;
  right: 0px;
  background: rgb(35, 35, 43) !important;
  z-index: 999;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
