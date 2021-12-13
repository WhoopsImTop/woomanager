<template>
    <div>
      <v-dialog
        v-model="lastEditedPopup"
        max-width="500px"
      >
        <v-card        
        class="glass2"
        dark
        >
          <v-card-title>Zuletzt Bearbeitet</v-card-title>
          <v-card-text>
            <v-list dark class="glass2">
              <v-list-item v-for="item in lastEdited" :key="item.id">
                <v-list-item-content>
                  <v-list-item-title>EAN: {{ item.EAN }}</v-list-item-title>
                  <v-list-item-subtitle>Bearbeiter: {{ item.Assignee }}</v-list-item-subtitle>
                  <v-list-item-subtitle>Datum:  {{ new Date(item.TimeStamp).getDate() }}.{{ new Date(item.TimeStamp).getMonth() }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="lastEditedPopup = false">Schließen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-dialog
        v-model="nameDialog"
        persistent
        max-width="500px"
      >
        <v-card        
        class="glass2"
        dark
        >
          <v-card-title>Name des Bearbeiters</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="bearbeiterName"
              label="Name"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="addBearbeiterName">Hinzufügen</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>



      <v-dialog
          v-model="dialog"
        >
          <v-card class="glass2" dark>
            <v-card-title>
              <span class="text-h5">Produkt Erstellen</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      id="name"
                      v-model="editedItem.name"
                      label="Produkt Name"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      v-model="editedItem.ean_code"
                      label="EAN"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      type="number"
                      v-model="editedItem.stock_quantity"
                      label="Bestand"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field
                      class="mt-7"
                      v-model="editedItem.sku"
                      label="Artikelnummer"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-combobox
                        class="my-5"
                        v-model="editedItem.categories"
                        :items="category"
                        item-text="name"
                        item-id="id"
                        item-value="slug"
                        divider= true
                        label="Kategorie"
                        multiple
                        chips
                        deletable-chips
                        >
                    </v-combobox>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-combobox
                        class="my-5"
                        v-model="editedItem.tags"
                        :items="tags"
                        item-text="name"
                        item-id="id"
                        item-value="slug"
                        divider= true
                        label="Schlagwörter"
                        multiple
                        chips
                        deletable-chips
                        >
                    </v-combobox>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-combobox
                        class="my-5"
                        v-model="status"
                        :items="statusItems"
                        item-text="name"
                        item-value="value"
                        label="Status"
                        >
                    </v-combobox>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-text-field
                        id="price"
                        class="my-5"
                        v-model="editedItem.regular_price"
                        label="Preis (€)"
                        >
                    </v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                  </v-col>
                  <v-row
                    style="margin: 0px 20px"
                    cols="12"
                    sm="12"
                    md="12"
                  >
                  <v-col
                    cols="12"
                    sm="4"
                    md="4"
                  >
                    <v-file-input
                      id="image"
                      @change="Compress"
                      v-model="chosenFile"
                      :loading="imgLoading"
                      truncate-length="16"
                      :hint="fileHint"
                      label="Bild"
                    ></v-file-input>
                  </v-col>
                    <div v-for="image in editedItem.images" :key="image" style="position: relative">
                      <v-btn
                        @click="RemovefromImageArray(editedItem.images.indexOf(image))"
                        style="position: absolute; bottom: 10px; left: 10px; z-index: 99"
                        color="secondary"
                        fab
                        x-small
                        dark
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-img max-width="100px" max-height="100px" style="margin: 2px" :src="image" />
                    </div>
                  </v-row>
                  <v-col
                    cols="12"
                    sm="12"
                    md="12"
                  >
                    <v-textarea
                        label="Beschreibung"
                        v-model="editedItem.description"
                    ></v-textarea>
                  </v-col>

                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="close"
              >
                Schließen
              </v-btn>
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

    <v-data-table
      dark
      :headers="headers"
      :items="scans"
      :item-class= "row_classes"
      :items-per-page="itemsPerPage"
      :single-select="singleSelect"
      :loading="loading"
      v-model="$store.state.selectedScans"
      item-key="_id"
      loading-text="Daten werden geaden"
      show-select
      class="elevation-1 glass"
    >
        <template v-slot:top>
          <v-toolbar
          flat
          class="glass border-rounded my-3"
          >
          <v-row v-if="$store.state.selectedScans.length != 0" >
            <v-select
              style="margin: 0; height: 56px;"
              label="Status ändern"
              outlined
              :items="Statuses"
              v-model="newStatus"
            >
            </v-select>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    @click="UpdateStatus()"
                    :loading="serverCheckLoading"
                    icon
                    link
                    dark
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-update</v-icon>
                    </v-btn>
                </template>
                <span>Status Aktualisieren</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    @click="DeleteMultiple()"
                    color="red"
                    :loading="serverCheckLoading"
                    icon
                    link
                    dark
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-delete-alert</v-icon>
                    </v-btn>
                </template>
                <span>Auswahl löschen</span>
            </v-tooltip>
            </v-row>
            
            <v-row v-else>
            <v-text-field
              class="mr-3"
              style="margin: 0; height: 56px;"
              dark
              outlined
              label="Suche"
              v-model="suche"
              @input="Search(suche)"
            >
            </v-text-field>
            <v-combobox
                style="margin: 0; height: 56px;"
                @change="StatusSorter()"
                outlined
                clearable
                :items="Statuses"
                label="Status Filter"
                v-model="$store.state.selectedStatus"
            >
            </v-combobox>
            <v-spacer></v-spacer> 
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    @click="getLastEdited()"
                    icon
                    link
                    dark
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-playlist-check</v-icon>
                    </v-btn>
                </template>
                <span>Zuletzt Bearbeitet</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    @click="GetData()"
                    icon
                    link
                    dark
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-reload</v-icon>
                    </v-btn>
                </template>
                <span>Liste neu laden</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    @click="CheckData()"
                    :loading="serverCheckLoading"
                    icon
                    link
                    dark
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-database-sync-outline</v-icon>
                    </v-btn>
                </template>
                <span>Liste abgleichen</span>
            </v-tooltip>
            </v-row>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card dark class="glass2">
                <v-card-title class="text-h5">EAN bearbeitet ?</v-card-title>
                <v-card-text>Haben Sie "{{ deleteItem.EAN }}" bearbeitet ?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialogDelete = false">Abbrechen</v-btn>
                  <v-btn color="red outlined" text @click="deleteItemConfirm">Ja</v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
     <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="modelDialog(item)"
        >
          mdi-package-variant-closed
        </v-icon>
    
    <a :href="url + item.EAN"
    target="_blank"
    >
      <v-icon
        small
        class="mr-2"
      >
        mdi-barcode-scan
      </v-icon>
      </a>
    <a :href="GoogleSearch + item.EAN"
    target="_blank"
    >
      <v-icon
        small
        class="mr-2"
      >
        mdi-earth
      </v-icon>
      </a>
      <v-icon
        small
        @click="removeProduct(item)"
      >
        mdi-check
      </v-icon>
    </template>
    </v-data-table>
    </div>
</template>
<script>
import axios from 'axios'
import imageCompression from 'browser-image-compression';

export default {
    data: () =>  ({
        dialog: false,
        nameDialog: localStorage.getItem('userName') ? false : true,
        bearbeiterName: "",
        scans: [],
        backupScans: [],
        Statuses: ["Bitte Aufnehmen", "nicht gefunden", "Später"],
        scanBackup: [],
        url: "https://www.barcodelookup.com/",
        GoogleSearch: "https://www.google.de/search?q=",
        productsUrl: 'https://bindis-schaulaedle.de/wp-json/wc/v3/products?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc',
        headers: [
            { text: "EAN", align: "start", sortable: false, value: "EAN"},
            { text: "Anzahl", align: "start", sortable: false, value: "Anzahl"},
            { text: "Zeitstempel", sortable: true, value: "TimeStamp"},
            { text: "Status", sortable: false, value: "Status"},
            { text: 'Funktionen', align: "end", value: 'actions', sortable: false },
        ],
        serverCheckLoading: false,
        page: 1,
        itemsPerPage: 15,
        dialogDelete: false,
        pageCount: '',
        singleSelect: false,
        selected: [],
        newStatus: [],
        btnLoading: false,
        imgLoading: false,
        suche: '',
        fileHint: "",
        category: [],
        tags: [],
        chosenFile: null,
        editedIndex: -1,
        deleteItem: {
            EAN: '',
            Anzahl: '',
            TimeStamp: '',
            Status: '',
        },
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
        btnText: "Speichern",
        btnColor: "primary",
        lastEdited: [],
        lastEditedPopup: false,
        status: {
            name: "Entwurf",
            value: "draft"
        },
        statusItems: [
            {
                name: "Entwurf",
                value: "draft"
            }, 
            {
                name: "Veröffentlicht",
                value: "publish"
            }
        ],
    }),
    methods: {
      getLastEdited() {
        this.lastEditedPopup = true;
        axios
        .get('https://bindis.rezept-zettel.de/api/deleted')
        .then(response => {
            this.lastEdited = response.data.reverse()
        })
        .catch(error => {
            console.log(error)
        })
      },
      addBearbeiterName() {
        localStorage.setItem('userName', this.bearbeiterName)
        this.nameDialog = false
      },
      getEanData(ean) {
        axios.post('https://bindis.rezept-zettel.de/api/scrape', {
          "ean": ean
        })
        .then(res => {
          document.getElementById('name').value = res.data.name;
          this.editedItem.name = res.data.name;
          document.getElementById('price').value = res.data.price.split(",").join(".").split("€").join("");
          this.editedItem.regular_price = res.data.price.split(",").join(".").split("€").join("");
        })
        .catch(err => {
          console.log(err)
        })
      },
      Search(suche) {
        if(suche.length > 0) {
          this.scans = this.backupScans.filter((scan) => {
            return suche.toLowerCase().split(' ').every(v => scan.EAN.toLowerCase().includes(v));
          });
        } else if(suche.length === 0) {
          this.scans = this.backupScans
        }        
      },

      StatusSorter() {
        if(this.$store.state.selectedStatus != "Bitte Auswählen" && this.$store.state.selectedStatus != "" && this.$store.state.selectedStatus != undefined) {
          this.loading = true
          let newArray = []
          for(let i = 0; i < this.scanBackup.length; i++) {
            if(this.scanBackup[i].Status.toLowerCase() === this.$store.state.selectedStatus.toLowerCase()) {
              newArray.push(this.scanBackup[i])
            }
          }
          this.scans = newArray
          this.loading = false
        } else {
          this.scans = this.backupScans
        }
      },

      initialize () {
          this.category = this.$store.state.categories
          this.tags = this.$store.state.tags
      },

      Compress: async function () {
          this.imgLoading = true
          const imageFile = document.getElementById("image").files[0];
          try {
          this.file = URL.createObjectURL(this.chosenFile)
          } catch(e) {
            console.warn(e)
            this.imgLoading = false
            return
          }

          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: "png",
          }
          try {
            const compressedFile = await imageCompression(imageFile, options);

            await this.UploadImage(compressedFile);
          } catch (error) {
            console.log(error);
            this.imgLoading = false
            this.fileHint = "Dieser Bildtyp wird nicht unterstützt."
            return
          }
        },

        UploadImage(compressedFile) {
          let data = compressedFile
          axios
          .post('https://bindis-schaulaedle.de/wp-json/wp/v2/media', data, { 
            headers: {
              "Authorization": 'Bearer ' + this.$store.state.imageToken,
              'Content-Disposition': `attachment; filename=${compressedFile.name}`,
              'Content-type': compressedFile.type,
            }
          })
          .then((res) => {
                this.editedItem.images.push({
                  date_created: res.data.date,
                  date_created_gmt: res.data.date_gmt,
                  src: res.data.source_url,
                  name: res.data.slug
                })
                this.imgLoading = false
                })
            .catch((err) => {
              console.log("AXIOS ERROR: ", err);
              this.imgLoading = false
              this.fileHint = "Bild konnten ich hochgeladen werden"
            })
        },

        close () {
          this.dialog = false
          this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
          })
        },

        modelDialog(item) {
          this.dialog = true
          this.getEanData(item.EAN)
          this.editedItem.ean_code = item.EAN
          this.editedItem.stock_quantity = item.Anzahl
        },

        async GetData() {
            this.loading = true
            await axios
            .get('https://bindis.rezept-zettel.de/api/scans')
            .then(response => {
                this.scans = response.data
                this.backupScans = response.data
                this.scanBackup = response.data
                this.loading = false
            })
            .catch((e) => {
                console.log(e),
                this.loading = false
            }) 
            this.StatusSorter()
        },
        row_classes(item) {
        if (item.Status === "Bitte Aufnehmen") {
          return "orange";
            } 
        },

        removeProduct(item) {
            this.deleteItem = item
            this.dialogDelete = true
        },
        
        deleteItemConfirm() {
            axios
            .delete('https://bindis.rezept-zettel.de/api/scans/' + this.deleteItem._id,
            {
              data: {
                "Assignee": localStorage.getItem("userName")
              }
            })
               .then(response => {
                console.log(response)
                this.GetData()
            }).catch ((e) => {
                console.log(e)
            })
            this.deleteItem = {
            EAN: '',
            Anzahl: '',
            TimeStamp: '',
            Status: '',
            }
            this.dialogDelete = false
        },

        DeleteMultiple() {
          let Selected = this.$store.state.selectedScans
          console.log(Selected)
          for(var i = 0; i < this.$store.state.selectedScans.length; i++) {
            axios
            .delete('https://bindis.rezept-zettel.de/api/scans/' + this.$store.state.selectedScans[i]._id, {
            })
            .then(response => {
              console.log(response)
              this.GetData()
            })
            .catch((e) => {
              console.log(e)
            })
          }
          this.$store.state.selectedScans = []
        },
        
        UpdateStatus() {
          let NewStatus = this.newStatus
          let Selected = this.$store.state.selectedScans
          console.log(Selected)
          for(var i = 0; i < this.$store.state.selectedScans.length; i++) {
            axios
            .patch('https://bindis.rezept-zettel.de/api/scans/' + this.$store.state.selectedScans[i]._id, {
              "Status": NewStatus
            })
            .then(response => {
              console.log(response)
              this.GetData()
            })
            .catch((e) => {
              console.log(e)
            })
          }
          this.$state.store.selectedScans = []
        },

    CheckData: async function() {
      if (confirm("Dieser Vorgang kann sehr lange dauern und ist relativ rechenintensiv. Bist du dir sicher das du ihn starten möchtest ?") == true) {
      this.serverCheckLoading = true
      for(var i = 0; i < this.scans.length; i++) {
        let paramOptions = {
                search: this.scans[i].EAN
            }
        let current = this.scans[i]
        await axios.get(this.productsUrl, {params: paramOptions })
                .then((response) => {
                    console.log(response.data)
                    if(response.data.length === 1) {
                    axios
                      .delete('https://bindis.rezept-zettel.de/api/scans/' + current._id)
                      .then(response => {
                        console.log(response)
                        this.GetData()
                    }).catch ((e) => {
                        console.log(e)
                    })
                    }
                })
                .catch( (error) => {
                    console.log(error);
                });
              }
                this.serverCheckLoading = false
              }
              else {
                return
              }
            },

      save () {
        this.btnLoading = true
        this.editedItem.meta_data.push({"key": "_wpm_gtin_code","value": this.editedItem.ean_code})
        this.editedItem.status = this.status.value
        axios.post(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc`,
          this.editedItem)
        .then(Response => {
          this.$store.state.products.push(Response.data)
          this.btnLoading = false
          this.btnText = "Produkt erfolgreich erstellt"
          this.btnColor = "success"

        setTimeout(() => {
          this.btnLoading = false
          this.btnText = "speichern"
          this.btnColor = "blue"
          this.close()
        }, 2000)
        })
        .catch((e) => {
          console.log(e)
          this.btnLoading = false
          this.btnText = "Produkt konnte nicht erstellt werden"
          this.btnColor = "danger"
        setTimeout(() => {
          this.btnText = "speichern"
          this.btnColor = "blue"
          this.close()
          }, 2000)
        })
      },
    },
    async created() {
        this.GetData()
        this.initialize()
    }
}
</script>
