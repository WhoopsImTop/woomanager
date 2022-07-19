<template>
  <div>
    <imageEditorPopup @closeImagePopup="imgPopup = false" :imagePopup="imgPopup" :loading="imgLoading"
      @croppedImage="UploadImage($event)" />

    <div style="display: flex; justify-content: space-between; align-items: center">
      <v-row cols="12">
        <v-col :cols="$store.state.selectedProducts.length > 0 ? 4 : 8">
          <h1 style="margin: 20px 0">Produkte</h1>
        </v-col>

        <v-col v-show="$store.state.selectedProducts.length > 0" cols="2">
          <v-combobox inset v-model="batchStatus" :items="showDraftOnly" label="Status Zuweisen" outlined
            item-text="name" item-value="value" style="margin-top: 10px; margin-bottom: -20px" dark color="warning">
          </v-combobox>
        </v-col>

        <v-col cols="2">
          <v-combobox v-show="$store.state.selectedProducts.length > 0" inset multiple v-model="batchCategory"
            :items="$store.state.categories" label="Kategorie Zuweisen" outlined item-text="name" item-value="value"
            style="margin-top: 10px; margin-bottom: -20px" dark color="warning">
          </v-combobox>
        </v-col>

        <v-col v-show="$store.state.selectedProducts.length > 0" cols="2">
          <v-btn @click="BatchUpdateProducts()" :loading="batchLoading" x-large
            style="margin-top: 10px; margin-bottom: -20px" dark color="primary">Produkte aktualiseren</v-btn>
        </v-col>

        <v-col cols="2">
          <v-combobox inset v-model="status" :items="showDraftOnly" @change="searchName()" label="Zeige" outlined
            item-text="name" item-value="value" style="margin-top: 10px; margin-bottom: -20px" dark color="warning">
          </v-combobox>
        </v-col>
      </v-row>
    </div>
    <v-data-table dark v-model="$store.state.selectedProducts" show-select :headers="headers"
      :items="$store.state.products" item-key="id" class="elevation-1 glass" :loading="dataLoading">
      <template v-slot:top>
        <v-toolbar flat class="glass border-rounded my-3">
          <v-toolbar-title>Suche</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field style="margin: 0; height: 56px" dark class="cols-2" outlined label="Suche"
            @change="searchName()" v-model="suche">
          </v-text-field>
          <!-- <v-combobox
            dark
            label="Kategorie Suche"
            :items="category"
            v-model="searchCategoryItem"
            @change="filteredCategories()"
            clearable
            style="margin: 0 10px; height: 56px"
            outlined
            item-text="name"
            item-value="name"
          >
          </v-combobox>
          -->
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="secondary" dark class="mb-2" v-bind="attrs" v-on="on">
                Neues Produkt
              </v-btn>
            </template>
            <v-card class="glass2">
              <v-card-title>
                <v-badge tile bottom inline color="success" :content="TranslateType(editedItem.type)">
                  <span class="text-h5">{{ formTitle }}</span>
                </v-badge>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field dark v-model="editedItem.name" label="Produkt Name"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field dark type="number" v-model="editedItem.ean_code" label="EAN"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field dark type="number" v-model="editedItem.stock_quantity" label="Bestand">
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field dark class="mt-7" v-model="editedItem.sku" label="Artikelnummer"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-combobox dark class="my-5" v-model="editedItem.categories" :items="category" item-text="name"
                        item-id="id" item-value="slug" divider="true" label="Kategorie" multiple chips deletable-chips>
                      </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-combobox dark class="my-5" v-model="editedItem.tags" :items="tags" item-text="name"
                        item-id="id" item-value="slug" divider="true" label="Schlagwörter" multiple chips
                        deletable-chips>
                      </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-radio-group dark row v-model="editedItem.status">
                        <v-radio value="draft">
                          <template v-slot:label>Entwurf</template>
                        </v-radio>
                        <v-radio value="pending">
                          <template v-slot:label>
                            <div>Ausstehend</div>
                          </template>
                        </v-radio>
                        <v-radio value="future">
                          <template v-slot:label>
                            <div>Geplant</div>
                          </template>
                        </v-radio>
                        <v-radio value="publish">
                          <template v-slot:label>
                            <div>Öffentlich</div>
                          </template>
                        </v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-col cols="12" sm="4" md="4">
                      <v-text-field dark type="number" class="my-5" v-model="editedItem.regular_price"
                        label="Preis (€)">
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4" md="4"> </v-col>
                    <v-row style="margin: 0px 20px" cols="12" sm="12" md="12">
                      <v-col cols="12" sm="4" md="4">
                        <v-btn color="accent darken-1" class="mt-4" @click="imgPopup = true">
                          <v-icon>mdi-upload</v-icon> Bild auswählen
                        </v-btn>
                      </v-col>
                      <div v-for="image in editedItem.images" :key="image.id" style="position: relative">
                        <v-btn @click="
                          RemovefromImageArray(
                            editedItem.images.indexOf(image)
                          )
                        " style="
                            position: absolute;
                            bottom: 10px;
                            left: 10px;
                            z-index: 99;
                          " color="secondary" fab x-small dark>
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-img max-width="100px" max-height="100px" style="margin: 2px" :src="image" />
                      </div>
                    </v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-textarea dark label="Beschreibung" v-model="editedItem.description"></v-textarea>
                    </v-col>
                  </v-row>
                </v-container>

                <v-expansion-panels dark>
                  <v-expansion-panel dark class="glass2">
                    <v-expansion-panel-header>
                      <span>
                        <v-icon>mdi-sale</v-icon>
                        Angebot erstellen
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field dark v-model="editedItem.sale_price" label="Preis (€)"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                          <v-date-picker v-model="editedItem.date_on_sale_from" label="Startdatum" dark></v-date-picker>
                        </v-col>
                        <v-col cols="4">
                          <!-- sale start date -->
                          <v-date-picker v-model="editedItem.date_on_sale_to" label="Startdatum" dark></v-date-picker>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>

                  <h2 style="color: #fff; text-align: left" class="my-3" v-show="editedItem.type === 'variable'">
                    Variationen (In Arbeit)
                  </h2>
                  <!-- Variables Produkt -->
                  <v-expansion-panel v-show="editedItem.type === 'variable'" v-for="variation in editedItem.variations"
                    :key="variation.id" dark class="glass2">
                    <v-expansion-panel-header>
                      <span>
                        <v-icon>mdi-label</v-icon>
                        {{ variation.attributes[0].name }}:
                        {{ variation.attributes[0].option }}
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-row>
                        <v-col cols="4">
                          <v-text-field dark v-model="variation.regular_price" disabled label="Preis (€)">
                          </v-text-field>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>

              <v-card-actions>
                <a v-show="editedItem.status == 'publish'" style="color: #fff; text-decoration: none;" :href="editedItem.permalink" target="_blank">Vorschau</a>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="close"> Schließen </v-btn>
                <v-btn :loading="btnLoading || imgLoading" :color="btnColor" text @click="save">
                  {{ btnText }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card dark class="glass2">
              <v-card-title class="text-h5">Artikel Löschen ?</v-card-title>
              <v-card-text>Sind Sie sich sicher das sie "{{ editedItem.name }}" löschen
                wollen ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Abbrechen</v-btn>
                <v-btn color="red outlined" :loading="dialogLoading" text @click="deleteItemConfirm">Ja löschen</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="duplicationDialog" max-width="500px">
            <v-card dark class="glass2">
              <v-card-title class="text-h5">Artikel Duplizieren ?</v-card-title>
              <v-card-text>Sind Sie sich sicher das sie "{{ editedItem.name }}"
                Duplizieren wollen ?</v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDuplication">Abbrechen</v-btn>
                <v-btn color="green outlined" :loading="dialogLoading" text @click="duplicateItemConfirm">Ja Duplizieren
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.image="{ item }">
        <div class="p-2">
          <v-img :src="
            item.images[0].src
              ? item.images[0].src
              : 'https://bindis-schaulaedle.de/wp-content/uploads/woocommerce-placeholder.png'
          " :alt="item.src" height="75px" width="75px"></v-img>
        </div>
      </template>
      <template v-slot:item.badge="{ item }">
        <v-chip class="ma-2" :color="TranslateStatus(item.status).color" label text-color="white">
          <v-icon left>
            {{ TranslateStatus(item.status).icon }}
          </v-icon>
          {{ TranslateStatus(item.status).status }}
        </v-chip>
      </template>
      <template v-slot:item.date="{ item }">
        <span>{{ DateFormatter(item.date_modified) }}</span>
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="text-center">
          <v-menu bottom offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on">
                Ich möchte
              </v-btn>
            </template>

            <v-list dark>
              <v-list-item link @click="editItem(item)">
                <v-list-item-title>Produkt Bearbeiten</v-list-item-title>
              </v-list-item>
              <v-list-item link @click="DuplicateItem(item)">
                <v-list-item-title>Produkt Duplizieren</v-list-item-title>
              </v-list-item>
              <v-list-item link @click="deleteItem(item)">
                <v-list-item-title>Produkt Löschen</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
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
import productClass from "../classes/productClass";

export default {
  data: () => ({
    showDraft: false,
    imgPopup: false,
    batchLoading: false,
    status: "",
    batchStatus: "",
    batchCategory: [],
    showDraftOnly: [
      {
        name: "Entwurf",
        value: "draft",
      },
      {
        name: "Ausstehend",
        value: "pending",
      },
      {
        name: "Geplant",
        value: "future",
      },
      {
        name: "Öffentlich",
        value: "publish",
      },
    ],
    dialog: false,
    duplicationDialog: false,
    dialogDelete: false,
    dataLoading: false,
    btnLoading: false,
    btnText: "Speichern",
    searchCategoryItem: null,
    btnColor: "blue",
    chosenFile: null,
    category: null,
    tags: null,
    fileHint: "",
    dialogLoading: false,
    imgLoading: false,
    suche: "",
    newStatus: "",
    statusItems: ["Entwurf", "Freigabe", "Öffentlich"],
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
        width: 300,
        sortable: false,
        value: "name",
      },
      {
        text: "Status",
        align: "start",
        sortable: true,
        value: "badge",
      },
      { text: "Bearbeitet am", value: "date" },
      { text: "EAN", value: "ean_code" },
      { text: "Bestand", value: "stock_quantity" },
      { text: "Artikelnummer", value: "sku" },
      { text: "Preis", value: "regular_price" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    backupProducts: null,
    editedIndex: -1,
    whatToShow: [
      {
        name: "kein Filter Aktiv",
        value: false,
      },
      {
        name: "Entwurf",
        value: "draft",
      },
      {
        name: "kein Bild",
        value: "no_image",
      },
    ],
    editedItem: {
      id: 0,
      name: "",
      description: "",
      price: 0,
      stock_quantity: 0,
      sku: "",
      ean_code: "",
      meta_data: [],
      images: [],
      status: "draft",
      category: "",
      tags: [],
      type: "simple",
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
    BatchUpdateProducts() {
      this.batchLoading = true;
      let products = this.$store.state.selectedProducts;
      let status = this.batchStatus != "" ? this.batchStatus.value : "";
      let batchCategories = this.batchCategory;

      products.forEach((product) => {
        //if product has no category, add the batch
        if (product.categories == null || product.categories == []) {
          product.categories = batchCategories;
        } else {
          //if product has category, add the batch to the array
          product.categories.push(...batchCategories);
        }
        if (status != "") {
          product.status = status;
        }
        product.updateProduct(product);
      });
      this.batchLoading = false;
    },

    saveCurrentProduct() {
      let item = this.editedItem
      localStorage.setItem('backupProduct', item);
    },

    checkForSaved() {
      console.log("Test")
      if (this.editedIndex === -1) {
        this.editedItem = localStorage.getItem('backupProduct')
      }
    },

    searchName() {
      this.dataLoading = true;
      if (this.status == "") {
        axios
          .get(
            `${localStorage.getItem(
              "shopURL"
            )}/wp-json/wc/v3/products?consumer_key=${localStorage.getItem(
              "ck"
            )}&consumer_secret=${localStorage.getItem("cs")}&search=${this.suche
            }`
          )
          .then((response) => {
            this.$store.state.products = [];
            for (let i = 0; i < response.data.length; i++) {
              this.$store.state.products.unshift(new productClass(response.data[i]));
            }
            this.dataLoading = false;
          })
          .catch((e) => {
            this.$store.state.products = [];
            console.log(e);
            this.dataLoading = false;
          });
      } else {
        axios
          .get(
            `${localStorage.getItem(
              "shopURL"
            )}/wp-json/wc/v3/products?consumer_key=${localStorage.getItem(
              "ck"
            )}&consumer_secret=${localStorage.getItem("cs")}&search=${this.suche
            }&status=${this.status.value}`
          )
          .then((response) => {
            this.$store.state.products = response.data;
            this.dataLoading = false;
          })
          .catch((e) => {
            this.$store.state.products = [];
            this.dataLoading = false;
            console.log(e);
          });
      }
    },

    init() {
      this.category = this.$store.state.categories;
      this.tags = this.$store.state.tags;
    },

    TranslateType(type) {
      if (type == "simple") {
        return "Einfaches Produkt";
      } else if (type == "variable") {
        return "Variables Produkt";
      }
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
      let name = this.editedItem.name + " (Duplikat)";
      let productData = {
        name: name,
        categories: this.editedItem.categories,
        tags: this.editedItem.tags,
        description: this.editedItem.description,
        status: "draft",
      };
      let duplicatedProduct = new productClass(productData);
      duplicatedProduct
        .createProduct()
        .then(() => {
          this.dialogLoading = false;
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
          status: "Entwurf",
          default: "draft",
          color: "#CF4516FF",
          icon: "mdi-file-clock-outline",
        };
      } else if (status === "publish") {
        return {
          status: "Öffentlich",
          default: "publish",
          color: "#1674CFFF",
          icon: "mdi-earth",
        };
      } else if (status === "pending") {
        return {
          status: "Bitte Freigeben",
          default: "pending",
          color: "#CF7716FF",
          icon: "mdi-file-check-outline",
        };
      } else if (status === "future") {
        return {
          status: "Geplant",
          default: "future",
          color: "#CF7716FF",
          icon: "mdi-file-check-outline",
        };
      } else {
        return {
          status: "Bitte Nochmal Speichern",
          default: "draft",
          color: "#666666",
          icon: "mdi-file-clock-outline",
        };
      }
    },

    TranslateSelectStatus(status) {
      if (status === "draft") {
        return "Entwurf";
      } else if (status === "publish") {
        return "Öffentlich";
      } else {
        return "Bitte Nochmal Speichern";
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
          data = null;
        })
        .catch((err) => {
          console.log("AXIOS ERROR: ", err);
          this.imgLoading = false;
          this.fileHint = "Bild konnte nicht hochgeladen werden";
        });
    },

    editItem(item) {
      this.editedIndex = this.$store.state.products.indexOf(item);
      console.log(item);
      if (item.variations != []) {
        // find products of variation array by id
        this.$store.state.products.find((product) => {
          item.variations.forEach((variation) => {
            if (product.id == variation) {
              console.log(product);
            }
          });
        });
      }
      this.newStatus = this.TranslateStatus(item.status).status;
      this.editedItem = item;
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.$store.state.products.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    DuplicateItem(item) {
      this.editedIndex = this.$store.state.products.indexOf(item);
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
          `${localStorage.getItem("shopURL")}/wp-json/wc/v3/products/${this.editedItem.id
          }?consumer_key=${localStorage.getItem(
            "ck"
          )}&consumer_secret=${localStorage.getItem("cs")}`
        )
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
      this.saveCurrentProduct()
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

    async save() {
      this.btnLoading = true;
      if (this.editedIndex != -1) {
        try {
          this.$store.state.products[this.editedIndex].method = "Patch";
          this.$store.state.products[this.editedIndex].edited_at = new Date();
          this.$store.state.products[this.editedIndex].loading = false;
          this.editedItem.edited_at = new Date();
          this.$store.commit(
            "addToList",
            this.$store.state.products[this.editedIndex]
          );
        } catch (e) {
          console.log(e);
        }
        Object.assign(
          this.$store.state.products[this.editedIndex],
          this.editedItem
        );
        this.editedItem.manage_stock = true;
        const message = await this.editedItem.updateProduct(this.editedItem);
        if (message === "success") {
          this.btnLoading = false;
          this.btnText = "Produkt erfolgreich bearbeitet";
          this.btnColor = "success";
          setTimeout(() => {
            this.btnText = "speichern";
            this.btnColor = "blue";
            this.close();
          }, 2000);
        } else {
          this.btnLoading = false;
          this.btnText = "Produkt konnte nicht bearbeitet werden";
          this.btnColor = "danger";
          setTimeout(() => {
            this.btnText = "speichern";
            this.btnColor = "blue";
            this.close();
          }, 2000);
        }
      } else {
        try {
          this.editedItem.method = "Post";
          this.editedItem.edited_at = new Date();
          this.editedItem.loading = false;
          this.$store.commit("addToList", this.editedItem);
        } catch (e) {
          console.log(e);
        }
        let product = new productClass(this.editedItem);
        const message = await product.createProduct();
        if (message === "success") {
          this.btnLoading = false;
          this.btnText = "Produkt erfolgreich erstellt";
          this.btnColor = "success";
          setTimeout(() => {
            this.btnText = "speichern";
            this.btnColor = "blue";
            this.close();
          }, 2000);
        } else {
          this.btnLoading = false;
          this.btnText = "Produkt konnte nicht erstellt werden";
          this.btnColor = "danger";
          setTimeout(() => {
            this.btnText = "speichern";
            this.btnColor = "blue";
            this.close();
          }, 2000);
        }
      }
    },
  },
  created() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });

    let ean_code = params.ean_code;
    let stock_quantity = params.stock_quantity;

    if (ean_code && stock_quantity) {
      this.editedItem.ean_code = ean_code;
      this.editedItem.stock_quantity = stock_quantity;

      this.dialog = true;
    }
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
