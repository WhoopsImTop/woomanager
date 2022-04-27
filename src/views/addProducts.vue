<template>
  <div>
    <v-dialog dark v-model="addPopUp" max-width="500px">
      <v-card class="glass">
        <v-card-title>Produkt existiert</v-card-title>
        <v-card-text>
          <v-text-field
            outlined
            label="Name"
            disabled
            dark
            v-model="currentProduct.name"
          ></v-text-field>

          <v-text-field
            label="Wie viele Produkte sind gekommen?"
            dark
            v-model="newStock"
          ></v-text-field>
          
          <v-text-field
            label="Preis"
            dark
            v-model="currentProduct.regular_price"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="gray darken-1" text @click="addPopUp = false">
            Abbrechen
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :loading="btnLoading"
            @click="updateStock"
          >
            Hinzufügen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <h1 style="margin: 20px 0">Bitte Aufnehmen</h1>
    <v-sheet
      class="glass mb-3"
      style="
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      "
    >
      <v-text-field
        id="search"
        class="mt-6 ml-3 mr-3"
        dark
        v-model="Search"
        label="Suche"
        outlined
        @input="onScan"
      ></v-text-field>
    </v-sheet>
    <v-list v-if="ScannedList.length > 0" class="glass" nav dense>
      <v-list-item-group class="my-5" v-model="selectedItem" color="primary">
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
                <v-list-item-subtitle
                  v-text="item.TimeStamp"
                ></v-list-item-subtitle>
              </v-col>
              <v-col>
                <v-list-item-subtitle
                  >{{ item.Anzahl }} x gescannt</v-list-item-subtitle
                >
              </v-col>
            </v-row>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="removeItem(item._id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-card v-else dark class="glass">
      <v-card-title>Du hast bis jetzt keine Artikel gescannt</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <span
          >Jetzt einfach Produkte Scannen, die du als
          <i>"Bitte Aufnehmen"</i> speichern willst.</span
        >
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data: () => {
    return {
      productsUrl: `${localStorage.getItem(
        "shopURL"
      )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
        "ck"
      )}&consumer_secret=${localStorage.getItem("cs")}`,
      headers: [
        { text: "EAN", align: "start", sortable: false, value: "EAN" },
        { text: "Status", sortable: false, value: "Status" },
        { text: "Zeitstempel", sortable: true, value: "TimeStamp" },
        { text: "Funktionen", align: "end", sortable: false, value: "actions" },
      ],
      addPopUp: false,
      loading: false,
      foundScans: [],
      searchEANText: "",
      currentProduct: [],
      newStock: 0,
      selectedItem: [],
      ScannedList: [],
      FailedScanList: [],
      btnLoading: false,
      Search: "",
    };
  },
  methods: {
    onScan() {
      if (this.Search.length > 6 && document.hasFocus()) {
        setTimeout(() => {
          this.handleScanSearch(this.Search);
          this.Search = "";
        }, 200);
      }
    },
    handleScanSearch(EAN) {
      if (EAN != "") {
        try {
          const Product = this.$store.state.products.find((item) => {
            if (item.ean_code == EAN) {
              return item;
            }
          });
          if (Product) {
            this.currentProduct = Product;
            this.addPopUp = true;
          } else {
            this.$store.state.socket.emit("addTodo", {
              EAN: EAN,
              Status: "Bitte Aufnehmen",
            });
          }
        } catch (error) {
          console.log(error);
          this.FailedScanList.push({
            EAN: EAN,
            Status: "Bitte Aufnehmen",
          });
          localStorage.setItem(
            "FailedScanList",
            JSON.stringify(this.FailedScanList)
          );
        }
      }
    },
    async updateStock() {
      console.log(this.currentProduct);
      this.currentProduct.stock_quantity =
        parseInt(this.currentProduct.stock_quantity) + parseInt(this.newStock);
      this.btnLoading = true;
      await this.currentProduct.updateProduct(this.currentProduct);
      this.btnLoading = false;
      this.addPopUp = false;
    },
    addToList(data) {
      //check if item is already in list
      let found = this.ScannedList.find((item) => item.EAN == data.EAN);
      if (found == undefined) {
        this.ScannedList.push(data);
      } else {
        found.Anzahl += 1;
      }
    },
    reUploadItem() {
      //upload failed scans
      let FailedScanList = JSON.parse(localStorage.getItem("FailedScanList"));
      if (FailedScanList) {
        FailedScanList.forEach((item) => {
          axios
            .post("https://bindis.rezept-zettel.de/api/scans", {
              EAN: item.EAN,
              Status: "Bitte Aufnehmen",
            })
            .then((response) => {
              if (response.data.includes(item.EAN)) {
                this.addToList(response.data);
                this.FailedScanList.splice(FailedScanList.indexOf(item), 1);
              } else {
                axios
                  .get("https://bindis.rezept-zettel.de/api/scans/" + item.EAN)
                  .then((response) => {
                    this.addToList(response.data);
                    this.FailedScanList.splice(FailedScanList.indexOf(item), 1);
                  });
              }
            });
        });
      }
      localStorage.setItem(
        "FailedScanList",
        JSON.stringify(this.FailedScanList)
      );
    },
    async removeItem(id) {
      axios
        .delete(`https://bindis.rezept-zettel.de/api/scans/${id}`)
        .then(() => {
          this.ScannedList.splice(this.ScannedList.indexOf(id), 1);
        });
    },
  },
  mounted() {
    document.getElementById("search").focus();
    this.FailedScanList = JSON.parse(localStorage.getItem("FailedScanList"));

    this.$store.state.socket.on("addTodo", (data) => {
      console.log(data);
      this.addToList(data);
      if (localStorage.getItem("FailedScanList")) {
        this.reUploadItem();
      }
    });
  },
};
</script>

<style>
</style>