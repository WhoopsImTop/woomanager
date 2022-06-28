<template>
  <div>
    <v-dialog v-model="dialog" persistent>
      <v-card class="glass" dark>
        <v-card-title class="text-h5">
          Wollen Sie den Scan wirklich löschen?
        </v-card-title>
        <v-card-text>EAN: {{ selectedItem.EAN }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="dialog = false">
            Abbrechen
          </v-btn>
          <v-btn color="red" text @click="removeItem()"> löschen </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <h1 style="margin: 20px 0">Barcodescanner</h1>
    <v-row class="h-full">
      <v-col cols="10">
        <v-data-table dark :headers="headers" :items="$store.state.scans" :items-per-page="itemsPerPage"
          :loading="loading" loading-text="Daten werden geaden" class="elevation-1 glass">
          <template v-slot:top>
            <div class="col" style="position: relative">
              <v-text-field id="EANScanner" v-model="searchParam" label="Suche" color="success" class="mt-2"
                @input="onScan" :error="fieldSelected" outlined></v-text-field>
              <span style="position: absolute; top: 80px; color: #ff5252">{{
                  fieldhint
              }}</span>
            </div>
            <div style="
                position: relative;
                display: flex;
                height: 50px;
                align-items: center;
              ">
              <v-chip v-show="searchEANText != ''" class="glass" color="green">{{ searchEANText }}</v-chip>
            </div>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="2" style="
          position: relative;
          display: flex;
          flex-direction: column;
          background-color: #efefef;
          text-align: center;
          color: #353535;
        ">
        <h2>Verkauf</h2>
        <hr />
        <div style="overflow-y: scroll; height: 100%">
          <div style="
              display: flex;
              justify-content: space-between;
              font-family: monospace;
            " v-for="(item, i) in $store.state.foundScans" :key="i">
            <span style="
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
              ">{{ item.product.name }}</span>
            <span>{{ item.product.regular_price }}</span>
          </div>
        </div>
        <div style="
            position: absolute;
            bottom: 10px;
            width: 90%;
            z-index: 10;
            background-color: #efefef;
          ">
          <hr />
          <span style="font-family: monospace">Gesamt: {{ countPrices.toFixed(2) }}€</span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from "axios";
import Scan from "../classes/scanClass";

export default {
  data: () => {
    return {
      productsUrl:
        "https://bindis-schaulaedle.de/wp-json/wc/v3/products?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc",
      headers: [
        { text: "EAN", align: "start", sortable: false, value: "ean" },
        { text: "Status", sortable: false, value: "status" },
        { text: "Zeitstempel", sortable: true, value: "timestamp" },
      ],
      scans: [],
      itemsPerPage: 10,
      loading: false,
      suche: "",
      searchParam: "",
      searchEANText: "",
      dialog: false,
      selectedItem: [],
      ScannedList: [],
      failedUploadScans: [],
      eanCode: "",
      statusCode: "",
      fieldSelected: true,
      fieldhint: "Ich bin nicht ausgewählt",
    };
  },
  computed: {
    countPrices() {
      let price = 0;
      for (let i = 0; i < this.$store.state.foundScans.length; i++) {
        if (
          this.$store.state.foundScans[i].product.regular_price != "" &&
          this.$store.state.foundScans[i].product.regular_price != null &&
          this.$store.state.foundScans[i].product.regular_price != undefined
        ) {
          price += parseFloat(
            this.$store.state.foundScans[i].product.regular_price
          );
        }
      }
      return price;
    },
    routeParams() {
      let value = false;
      if (this.$route.query.debug) {
        value = true;
      } else {
        value = false;
      }
      return value;
    },
  },
  methods: {
    onScan() {
      if (this.searchParam.length > 6 && document.hasFocus()) {
        setTimeout(() => {
          this.Scan(this.searchParam);
          this.searchParam = "";
        }, 200);
      }
    },
    async Scan(Search) {
      if (Search == "" || Search.length < 6) {
        return;
      }
      axios
        .get(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}&search=${Search}`
        )
        .then((response) => {
          console.log(response.data)
          if (response.data.length == 0) {
            this.searchEANText = "Produkt nicht gefunden";
            let scan = new Scan(
              Search,
              "nicht gefunden",
            );
            scan.addScan();
          } else if(response.data.length > 0) {
            this.searchEANText = "Produkt gefunden";
            let currentProduct = this.$store.state.products.find(
              product => {
                if (product.id == response.data[0].id) {
                  return product;
                }
              }
            );
            let scan = new Scan(Search, "gefunden", currentProduct);
            this.$store.state.foundScans.unshift(scan);
            scan.reductProductStock();
          }
        });
      setTimeout(() => {
        this.searchEANText = "";
      }, 1000);
    },

    removeItem() {
      this.selectedItem.deleteScan();
      this.dialog = false;
    },
    removeProduct(item) {
      this.selectedItem = item;
      this.dialog = true;
    },
    async ReduceProduct(id, stock_quantity) {
      let newStock = stock_quantity - 1;
      axios.post(
        "https://bindis-schaulaedle.de/wp-json/wc/v3/products/" +
        id +
        "?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc",
        {
          stock_quantity: newStock,
        }
      );
      let index = await this.$store.state.products.findIndex(
        (x) => x.id === id
      );
      this.$store.state.products[index].stock_quantity = newStock;
    },
    CountUpProduct: function (ID) {
      axios
        .get(
          "https://bindis-schaulaedle.de/wp-json/wc/v3/products/" +
          ID +
          "?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc"
        )
        .then((response) => {
          let res = response.data.stock_quantity;
          let NewStock = res + 1;
          axios
            .post(
              "https://bindis-schaulaedle.de/wp-json/wc/v3/products/" +
              ID +
              "?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc",
              {
                stock_quantity: NewStock,
              }
            )
            .then((response) => {
              console.log(response);
            })
            .catch((e) => {
              console.log(e);
            });
        });
    },
  },
  mounted() {
    let EANScanner = document.getElementById("EANScanner");
    EANScanner.addEventListener("blur", () => {
      this.fieldSelected = true;
      this.fieldhint = "Ich bin nicht ausgewählt";
      EANScanner.focus();
    });
    EANScanner.addEventListener("focus", () => {
      this.fieldSelected = false;
      this.fieldhint = "";
    });
    this.$store.state.socket.on("addTodo", (data) => {
      this.scans.push({
        Id: data.Id,
        EAN: data.EAN,
        Status: data.Status,
        TimeStamp: data.TimeStamp,
      });
    });

    setTimeout(() => {
      EANScanner.focus();
    }, 5000);

    this.$store.state.socket.on("updateTodo", (data) => {
      this.scans.splice(this.scans.indexOf(data), 1);
    });

    this.$store.state.socket.on("addTodoError", () => {
      this.failedUploadScans = localStorage.getItem("failedUploadScans")
        ? JSON.parse(localStorage.getItem("failedUploadScans"))
        : [];
      this.failedUploadScans.push({
        EAN: this.eanCode,
        Status: this.statusCode,
      });
      localStorage.setItem(
        "failedUploadScans",
        JSON.stringify(this.failedUploadScans)
      );
      this.eanCode = "";
      this.statusCode = "";
    });

    if (
      localStorage.getItem("failedUploadScans") != null ||
      localStorage.getItem("failedUploadScans") != undefined
    ) {
      this.failedUploadScans = localStorage.getItem("failedUploadScans");
      this.failedUploadScans = JSON.parse(this.failedUploadScans);
      // Upload items in array
      for (let i = 0; i < this.failedUploadScans.length; i++) {
        axios
          .post("https://bindis.rezept-zettel.de/api/scans", {
            EAN: this.failedUploadScans[i].EAN,
            Status: this.failedUploadScans[i].Status,
          })
          .then(() => {
            // remove item from array
            this.failedUploadScans.splice(i, 1);
            localStorage.setItem(
              "failedUploadScans",
              JSON.stringify(this.failedUploadScans)
            );
          });
      }
    }
  },
};
</script>

<style>
</style>