<template>
  <div>
    <imageEditorPopup
      @closeImagePopup="imgPopup = false"
      :imagePopup="imgPopup"
      :loading="imgLoading"
      @croppedImage="UploadImage($event)"
    />

    <h1 style="margin: 20px 0">Produkte</h1>
    <v-data-table
      dark
      :headers="headers"
      :items="searchProducts"
      item-key="id"
      sort-by="calories"
      class="elevation-1 glass"
      :loading="dataLoading"
    >
      <template v-slot:top>
        <v-toolbar flat class="glass border-rounded my-3">
          <v-toolbar-title>Suche</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field
            style="margin: 0; height: 56px"
            dark
            class="cols-2"
            outlined
            label="Suche"
            v-model="suche"
          >
          </v-text-field>
          <v-combobox
            dark
            label="Kategorie Suche"
            :items="category"
            v-model="searchCategory"
            style="margin: 0 10px; height: 56px"
            outlined
            item-text="name"
            @change="SearchCategory()"
            item-value="name"
          >
          </v-combobox>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="secondary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                Neues Produkt
              </v-btn>
            </template>
            <v-card class="glass2">
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        dark
                        v-model="editedItem.name"
                        label="Produkt Name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        dark
                        v-model="editedItem.ean_code"
                        label="EAN"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        dark
                        type="number"
                        v-model="editedItem.stock_quantity"
                        label="Bestand"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        dark
                        class="mt-7"
                        v-model="editedItem.sku"
                        label="Artikelnummer"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-combobox
                        dark
                        class="my-5"
                        v-model="editedItem.categories"
                        :items="category"
                        item-text="name"
                        item-id="id"
                        item-value="slug"
                        divider="true"
                        label="Kategorie"
                        multiple
                        chips
                        deletable-chips
                      >
                      </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-combobox
                        dark
                        class="my-5"
                        v-model="editedItem.tags"
                        :items="tags"
                        item-text="name"
                        item-id="id"
                        item-value="slug"
                        divider="true"
                        label="Schlagwörter"
                        multiple
                        chips
                        deletable-chips
                      >
                      </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-combobox
                        dark
                        class="my-5"
                        v-model="status"
                        :items="statusItems"
                        item-text="name"
                        item-value="value"
                        label="Status"
                      >
                      </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field
                        dark
                        class="my-5"
                        v-model="editedItem.regular_price"
                        label="Preis (€)"
                      >
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4" md="4"> </v-col>
                    <v-row style="margin: 0px 20px" cols="12" sm="12" md="12">
                      <v-col cols="12" sm="4" md="4">
                        <v-btn
                          color="accent darken-1"
                          class="mt-4"
                          @click="imgPopup = true"
                          ><v-icon>mdi-upload</v-icon> Bild auswählen</v-btn
                        >
                      </v-col>
                      <div
                        v-for="image in editedItem.images"
                        :key="image"
                        style="position: relative"
                      >
                        <v-btn
                          @click="
                            RemovefromImageArray(
                              editedItem.images.indexOf(image)
                            )
                          "
                          style="
                            position: absolute;
                            bottom: 10px;
                            left: 10px;
                            z-index: 99;
                          "
                          color="secondary"
                          fab
                          x-small
                          dark
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-img
                          max-width="100px"
                          max-height="100px"
                          style="margin: 2px"
                          :src="image"
                        />
                      </div>
                    </v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-textarea
                        dark
                        label="Beschreibung"
                        v-model="editedItem.description"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="close"> Schließen </v-btn>
                <v-btn
                  :loading="btnLoading || imgLoading"
                  :color="btnColor"
                  text
                  @click="save"
                >
                  {{ btnText }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card dark class="glass2">
              <v-card-title class="text-h5">Artikel Löschen ?</v-card-title>
              <v-card-text
                >Sind Sie sich sicher das sie "{{ editedItem.name }}" löschen
                wollen ?</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Abbrechen</v-btn
                >
                <v-btn
                  color="red outlined"
                  :loading="dialogLoading"
                  text
                  @click="deleteItemConfirm"
                  >Ja löschen</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="duplicationDialog" max-width="500px">
            <v-card dark class="glass2">
              <v-card-title class="text-h5">Artikel Duplizieren ?</v-card-title>
              <v-card-text
                >Sind Sie sich sicher das sie "{{ editedItem.name }}"
                Duplizieren wollen ?</v-card-text
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDuplication"
                  >Abbrechen</v-btn
                >
                <v-btn
                  color="green outlined"
                  :loading="dialogLoading"
                  text
                  @click="duplicateItemConfirm"
                  >Ja Duplizieren</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.image="{ item }">
        <div class="p-2">
          <v-img
            v-if="item.images.length != 0"
            :src="item.images[0].src"
            :alt="item.name"
            height="75px"
            width="75px"
          ></v-img>
        </div>
      </template>
      <template v-slot:item.badge="{ item }">
        <v-chip
          class="ma-2"
          :color="TranslateStatus(item.status).color"
          label
          text-color="white"
        >
          <v-icon left>
            {{ TranslateStatus(item.status).icon }}
          </v-icon>
          {{ TranslateStatus(item.status).status }}
        </v-chip>
      </template>
      <template v-slot:item.date="{ item }">
        <span>{{ DateFormatter(item.date_created) }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="DuplicateItem(item)">
          mdi-content-duplicate
        </v-icon>
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
        <div id="err">
          Es wurde kein Ergebniss für <strong>"{{ suche }}"</strong> gefunden
        </div>
      </template>
      <template v-slot:loading>
        <div id="err">Daten werden geladen...</div>
      </template>
    </v-data-table>
  </div>
</template>
  
<script>
import axios from "axios";
import imageEditorPopup from "../components/imageEditorPopup.vue";

export default {
  data: () => ({
    imgPopup: false,
    dialog: false,
    duplicationDialog: false,
    dialogDelete: false,
    dataLoading: false,
    btnLoading: false,
    btnText: "Speichern",
    searchCategory: [],
    btnColor: "blue",
    chosenFile: null,
    category: null,
    tags: null,
    fileHint: "",
    dialogLoading: false,
    imgLoading: false,
    suche: "",
    status: {
      name: "Entwurf",
      value: "draft",
    },
    statusItems: [
      {
        name: "Entwurf",
        value: "draft",
      },
      {
        name: "Veröffentlicht",
        value: "publish",
      },
    ],
    headers: [
      {
        text: "Bild",
        align: "start",
        sortable: false,
        value: "image",
      },
      {
        text: "Produkname",
        align: "start",
        sortable: false,
        value: "name",
      },
      {
        text: "Status",
        align: "start",
        sortable: true,
        value: "badge",
      },
      { text: "Erstellt am", value: "date" },
      { text: "EAN", value: "ean_code" },
      { text: "Bestand", value: "stock_quantity" },
      { text: "Artikelnummer", value: "sku" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    products: null,
    editedIndex: -1,
    editedItem: {
      regular_price: "",
      stock_quantity: 0,
      manage_stock: true,
      sku: "0",
      ean_code: 0,
      description: "",
      categories: [],
      tags: [],
      images: [],
      status: "draft",
      meta_data: [],
    },
    defaultItem: {
      regular_price: "",
      stock_quantity: 0,
      manage_stock: true,
      sku: "",
      ean_code: 0,
      description: "",
      categories: [],
      tags: [],
      images: [],
      meta_data: [],
      status: "draft",
    },
  }),
  components: {
    imageEditorPopup,
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Neues Produkt" : "Produkt bearbeiten";
    },
    searchProducts() {
      let searchName = this.suche.toLowerCase();
      return this.products.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchName) ||
          product.sku
            .toLowerCase()
            .includes(this.suche.toLowerCase().replace(/ /g, "")) ||
          product.ean_code
            .toLowerCase()
            .includes(this.suche.toLowerCase().replace(/ /g, ""))
        );
      });
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },

  beforeMount() {
    this.init();
  },

  methods: {
    init() {
      this.products = this.$store.state.products;
      //sort products by date
      this.products.sort((a, b) => {
        return new Date(b.date_created) - new Date(a.date_created);
      });
      this.category = this.$store.state.categories;
      this.tags = this.$store.state.tags;
    },
    DateFormatter(date) {
      let newDate = new Date(date);
      let day = newDate.getDate();
      let month = newDate.getMonth() + 1;
      let year = newDate.getFullYear();
      let hour = newDate.getHours();
      let minute = newDate.getMinutes();
      return (
        day + "." + month + "." + year + " " + hour + ":" + minute + " Uhr"
      );
    },
    duplicateItemConfirm() {
      this.dialogLoading = true;
      axios
        .post(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/${this.editedItem.id}?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`,
          {
            name: this.editedItem.name + " - Duplikat",
            manage_stock: true,
            categories: this.editedItem.categories,
            tags: this.editedItem.tags,
            description: this.editedItem.description,
            status: "draft",
          }
        )
        .then((res) => {
          this.dialogLoading = false;
          this.$store.state.products.unshift(res.data);
          this.closeDuplication();
        })
        .catch((e) => {
          window.alert("Produkt konnte nicht dupliziert werden", e);
          this.closeDuplication();
        });
    },

    TranslateStatus(status) {
      if (status === "draft") {
        return {
          status: "Entwutf",
          color: "#CF4516FF",
          icon: "mdi-file-clock-outline",
        };
      } else if (status === "publish") {
        return {
          status: "Veröffentlicht",
          color: "#1674CFFF",
          icon: "mdi-earth",
        };
      }
    },

    SearchCategory() {
      if (!this.searchCategory == "") {
        this.products = this.$store.state.products.filter((product) => {
          return this.searchCategory.name
            .toLowerCase()
            .split(" ")
            .every(
              (v) =>
                product.categories.filter((category) => {
                  return category.name.toLowerCase().includes(v);
                }).length > 0
            );
        });
      } else if (this.searchCategory == "") {
        this.products = this.$store.state.products;
      }
    },

    RemovefromImageArray(index) {
      this.editedItem.images.splice(index, 1);
    },

    UploadImage(compressedFile) {
      let data = compressedFile;
      axios
        .post("https://bindis-schaulaedle.de/wp-json/wp/v2/media", data, {
          headers: {
            Authorization: "Bearer " + this.$store.state.imageToken,
            "Content-Disposition": `attachment; filename=${compressedFile.name}`,
            "Content-type": compressedFile.type,
          },
        })
        .then((res) => {
          this.editedItem.images.push({
            date_created: res.data.date,
            date_created_gmt: res.data.date_gmt,
            src: res.data.source_url,
            name: res.data.slug,
          });
          this.imgPopup = false;
          this.imgLoading = false;
          data = null
        })
        .catch((err) => {
          console.log("AXIOS ERROR: ", err);
          this.imgLoading = false;
          this.fileHint = "Bild konnte nicht hochgeladen werden";
        });
    },

    editItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    DuplicateItem(item) {
      this.editedIndex = this.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.duplicationDialog = true;
    },

    deleteItemConfirm() {
      this.dialogLoading = true;
      try {
        this.editedItem.method = "Delete";
        this.editedItem.edited_at = new Date();
        this.editedItem.loading = false;
        this.$store.commit("addToList", this.editedItem);
      } catch (e) {
        console.log(e);
      }
      axios
        .delete(
          `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/${this.editedItem.id}?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`)
        .then(() => {
          this.$store.state.products.splice(this.editedIndex, 1);
          this.dialogLoading = false;
          this.closeDelete();
        })
        .catch((e) => {
          window.alert("Produkt konnte nicht gelöscht werden", e);
        });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDuplication() {
      this.duplicationDialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      this.btnLoading = true;
      if (this.editedIndex > -1) {
        if (this.editedItem.meta_data[0].key === "_wpm_gtin_code") {
          this.editedItem.meta_data[0].value = this.editedItem.ean_code;
        } else {
          this.editedItem.meta_data.push({
            key: "_wpm_gtin_code",
            value: this.editedItem.ean_code,
          });
        }
        try {
          this.products[this.editedIndex].method = "Patch";
          this.products[this.editedIndex].edited_at = new Date();
          this.products[this.editedIndex].loading = false;
          this.editedItem.edited_at = new Date();
          this.$store.commit("addToList", this.products[this.editedIndex]);
        } catch (e) {
          console.log(e);
        }
        Object.assign(this.products[this.editedIndex], this.editedItem);
        this.editedItem.status = this.status.value;
        this.editedItem.manage_stock = true;
        axios
          .patch(
            `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/${this.editedItem.id}?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`,
            this.editedItem
          )
          .then((Response) => {
            this.$store.state.products[this.editedIndex] = Response.data;
            this.$store.state.products.splice(
              1,
              0,
              this.$store.state.products.splice(this.editedIndex, 1)[0]
            );
            this.btnLoading = false;
            this.btnText = "Produkt erfolgreich bearbeitet";
            this.btnColor = "success";
            setTimeout(() => {
              this.btnText = "speichern";
              this.btnColor = "blue";
              this.close();
            }, 2000);
          })
          .catch((e) => {
            console.log(e);
            this.btnLoading = false;
            this.btnText = "Produkt konnte nicht bearbeitet werden";
            this.btnColor = "danger";
            setTimeout(() => {
              this.btnText = "speichern";
              this.btnColor = "blue";
              this.close();
            }, 2000);
          });
      } else {
        try {
          this.editedItem.method = "Post";
          this.editedItem.edited_at = new Date();
          this.editedItem.loading = false;
          this.$store.commit("addToList", this.editedItem);
        } catch (e) {
          console.log(e);
        }
        this.editedItem.meta_data.push({
          key: "_wpm_gtin_code",
          value: this.editedItem.ean_code,
        });
        this.editedItem.status = this.status.value;
        axios
          .post(
             `${localStorage.getItem(
            "shopURL"
          )}/wp-json/wc/v3/products/?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`,
            this.editedItem
          )
          .then((Response) => {
            this.btnLoading = false;
            this.btnText = "Produkt erfolgreich erstellt";
            this.btnColor = "success";
            this.$store.state.products.unshift(Response.data);
            setTimeout(() => {
              this.btnLoading = false;
              this.btnText = "speichern";
              this.btnColor = "blue";
              this.close();
            }, 2000);
          })
          .catch((e) => {
            console.log(e);
            this.btnLoading = false;
            this.btnText = "Produkt konnte nicht erstellt werden";
            this.btnColor = "danger";
            setTimeout(() => {
              this.btnText = "speichern";
              this.btnColor = "blue";
              this.close();
            }, 2000);
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
table {
  border-collapse: collapse;
  text-align: left;
  margin: 0 auto;
  margin-bottom: 20px;
  min-width: 90vw;
  border-radius: 10px;
  border: 1px solid #c0c0c0;
}
th {
  font-weight: bold;
  background-color: #efefef;
  padding: 10px 20px;
}
td {
  padding: 10px 20px;
}
.red {
  background-color: rgb(224, 43, 43);
  color: white;
}
.loading {
  background-color: #35353560;
  position: fixed;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.v-input__control {
  height: 46px;
}
</style>