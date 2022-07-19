<template>
  <div>
    <v-dialog v-model="dialog" width="500" persistent>
      <v-card class="glass" dark>
        <v-card-title class="text-h5">
          Wollen Sie den Scan wirklich löschen?
        </v-card-title>
        <v-card-text>EAN: {{ currentItem.ean }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn dark text @click="dialog = false">
            Abbrechen
          </v-btn>
          <v-btn color="red" text @click="removeItem()"> löschen </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <h1 style="margin: 20px 0">Barcodescanner</h1>
    <div class="col" style="position: relative">
      <v-text-field
        dark
        id="EANScanner"
        v-model="searchParam"
        label="Suche"
        color="success"
        class="mt-2"
        @input="onScan"
        :error="fieldSelected"
        outlined
      ></v-text-field>
      <span style="position: absolute; top: 80px; color: #ff5252">{{
        fieldhint
      }}</span>
    </div>
    <v-row class="h-full">
      <v-col cols="10">
        <div class="container">
          <div
            class="glass scan-item my-3"
            v-for="(item, i) in $store.state.scans"
            :key="i"
          >
            <span style="color: #fff">{{ item.ean }}</span>
            <span style="color: #fff">{{ item.status }}</span>
            <span style="color: #fff">{{ item.timestamp }}</span>
            <v-btn icon>
              <v-icon @click="removeProduct(item)" class="red--text">
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </div>
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
              min-height: 100%;
            "
            v-for="(item, i) in $store.state.foundScans"
            :key="i"
          >
            <span
              style="
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
              "
              >{{ item.name }}</span
            >
            <span>{{ item.regular_price }}</span>
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
          <span style="font-family: monospace"
            >Gesamt: {{ countPrices.toFixed(2) }}€</span
          >
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
      loading: false,
      suche: "",
      searchParam: "",
      searchEANText: "",
      dialog: false,
      selectedItem: [],
      ScannedList: [],
      failedUploadScans: [],
      currentItem: [],
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
          this.$store.state.foundScans[i].regular_price != "" &&
          this.$store.state.foundScans[i].regular_price != null &&
          this.$store.state.foundScans[i].regular_price != undefined
        ) {
          price += JSON.parse(this.$store.state.foundScans[i].regular_price);
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
      let scan = new Scan(Search);
      this.loading = true;
      await scan.checkProductsforEan();
      this.loading = false;
      setTimeout(() => {
        this.searchEANText = "";
      }, 1000);
    },
    async SaveItem(ean, status) {
      this.eanCode = ean;
      this.statusCode = status;
      this.$store.state.socket.emit("addTodo", {
        EAN: this.eanCode,
        Status: this.statusCode,
      });
    },
    async removeItem() {
      this.loading = true;
      await this.currentItem.deleteScan();
      this.dialog = false;
      this.loading = false;
    },
    removeProduct(item) {
      this.currentItem = item;
      this.dialog = true;
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

<style scoped>
.scan-item {
  display: flex;
  flex-basis: 150px;
  flex-grow: 2;
  height: 50px;
  align-items: center;
  justify-content: space-between;
}

.scan-container {
}
</style>