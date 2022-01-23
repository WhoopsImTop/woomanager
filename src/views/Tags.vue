<template>
  <div>
    <h1 style="margin: 20px 0">Schlagwörter</h1>
      <v-data-table
        dark
        :headers="headers"
        :items="tags"
        sort-by="calories"
        class="elevation-1 glass"
        :loading = dataLoading
      >
        <template v-slot:top>
          <v-toolbar
          flat
          class="glass border-rounded my-3"
          >
            <v-toolbar-title>Suche</v-toolbar-title>
            <v-divider
              class="mx-4"
              inset
              vertical
            ></v-divider>
            <v-text-field
              style="margin: 0; height: 56px;"
              dark
              class="cols-2"
              outlined
              label="Suche"
              v-model="suche"
              @input="Search(suche)"
            >
            </v-text-field>
            <v-spacer></v-spacer>
            <v-dialog
            v-model="dialog"
            >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
                >
                Neues Schlagwort
                </v-btn>
            </template>
            <v-card class="glass2">
                <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
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
                        dark
                        v-model="editedItem.name"
                        label="Kategorie Name"
                    ></v-text-field>
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
                    :loading="btnLoading"
                    text
                    @click="save"
                >
                    Speichern
                </v-btn>
                </v-card-actions>
            </v-card>
            </v-dialog>

            <v-dialog dark v-model="dialogDelete" max-width="500px">
              <v-card class="glass2">
                <v-card-title class="text-h5">Artikel Löschen ?</v-card-title>
                <v-card-text>Sind Sie sich sicher das sie "{{ editedItem.name }}" löschen wollen ?</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete">Abbrechen</v-btn>
                  <v-btn color="red outlined" :loading="dialogLoading" text @click="deleteItemConfirm">Ja löschen</v-btn>
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
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </div>
</template>

<script>
import axios from 'axios'
export default {
  data:() => {
    return {
      dataLoading: false,
      dialogLoading: false,
      dialog: false,
      btnLoading: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        name: "",
        description: ""
      },
      defaultItem: {
        name: "",
        description: ""
      },
      headers: [
        {
          text: 'Kategoriename',
          align: 'start',
          sortable: false,
          value: 'name',
        },
        { text: 'Actions', value: 'actions', align: 'end', sortable: false },
      ],
      tags: [],
      suche: '',
    }
  },
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Neues Schlagwort' : 'Schlagwort Bearbeiten'
    },
  },
  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {    
    getData() {
     this.tags = this.$store.state.tags
    },
    
    Search(suche) {
        if(suche.length > 0) {
          this.tags = this.$store.state.tags.filter((tags) => {
            return suche.toLowerCase().split(' ').every(v => tags.name.toLowerCase().includes(v));
          });
        } else if(suche.length === 0) {
          this.tags = this.$store.state.tags
        }        
    },

    editItem (item) {
        this.editedIndex = this.tags.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
    },

    deleteItem (item) {
        this.editedIndex = this.tags.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
    },

    deleteItemConfirm () {
        this.dialogLoading = true
        axios
        .delete(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/tags/${this.editedItem.id}?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc&force=true`)
        .then(() => {
          this.$store.state.tags.splice(this.editedIndex, 1)
          this.tags.splice(this.editedIndex, 1)
          this.dialogLoading = false
          this.getData()
          this.closeDelete()
        })
        .catch((e) => {
          window.alert("Produkt konnte nicht gelöscht werden", e)
        })
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },

      save () {
        this.btnLoading = true
        if (this.editedIndex > -1) {
          axios.patch(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/tags/${this.editedItem.id}?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc`,
          this.editedItem)
          .then(res => {
            this.$store.state.tags[this.editedIndex] = res.data
            this.btnLoading = false
            this.getData()
            setTimeout(() => {
              this.close()
            }, 2000)
          })
          .catch((e) => {
            console.log(e)
            this.btnLoading = false
            setTimeout(() => {
              this.close()
            }, 2000)
          })
        } else {
          axios.post(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/tags/?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc`,
          this.editedItem)
          .then(res => {
            this.$store.state.tags.push(res.data)
            this.btnLoading = false
            this.getData()
            setTimeout(() => {
              this.btnLoading = false
              this.close()
            }, 2000)
          })
          .catch((e) => {
            console.log(e)
            this.btnLoading = false
            setTimeout(() => {
              this.close()
            }, 2000)
          })
        }
      }
  },
  created() {
    this.getData()
  }
}
</script>

<style>

</style>