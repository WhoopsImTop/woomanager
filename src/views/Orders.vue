<template>
  <div>
            <v-dialog
            v-model="dialog"
            >
            <v-card class="glass2">
                <v-card-title>
                <span class="text-h5">Bestellung</span>
                </v-card-title>

                <v-card-text>
                <v-row>
                  <v-col>
                    <v-card class="glass" dark>
                      <v-card-title>Kundendetails</v-card-title>
                      <v-divider></v-divider>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Vorname"
                              v-model="editedItem.billing.first_name"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Nachname"
                              v-model="editedItem.billing.last_name"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Zahlungart"
                              v-model="editedItem.payment_method_title"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Bestelldatum"
                              v-model="editedItem.date_created"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="PLZ"
                              v-model="editedItem.billing.postcode"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Stadt"
                              v-model="editedItem.billing.city"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Email"
                              v-model="editedItem.billing.email"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Telefon"
                              v-model="editedItem.billing.phone"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                          <v-card class="glass">
                            <v-card-title>Bestelle Produkte</v-card-title>
                            
                              <div class="glass pa-3 my-2" v-for="item in editedItem.line_items" :key="item.id">
                                <span>{{ item.quantity }} x  {{ item.name }}</span>   
                              </div>
                           
                          </v-card>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col>
                    <v-card class="glass" dark>
                      <v-card-title>Lieferdetails</v-card-title>
                      <v-divider></v-divider>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Vorname"
                              v-model="editedItem.shipping.first_name"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Nachname"
                              v-model="editedItem.shipping.last_name"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Straße"
                              v-model="editedItem.shipping.address_1"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Land"
                              v-model="editedItem.shipping.country"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="PLZ"
                              v-model="editedItem.shipping.postcode"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              label="Stadt"
                              v-model="editedItem.shipping.city"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  
                </v-row>
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
    <h1 style="margin: 20px 0">Bestellungen</h1>
      <v-data-table
        dark
        :headers="headers"
        :items="orders"
        sort-by="calories"
        class="elevation-1 glass"
        :loading = dataLoading
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
          >
            mdi-pencil
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
          id: "",
          date_created: "",
          status: "",
          total: "",
          billing: {
            first_name: "",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            postcode: "",
            country: "",
            email: "",
            phone: "",
            title: ""
          },
          shipping: {
            first_name: "",
            last_name: "",
            company: "",
            address_1: "",
            address_2: "",
            city: "",
            state: "",
            postcode: "",
            country: "",
            phone: "",
            title: ""
          },
          payment_method_title: "",
          number: "",
          line_items: [],
          },
      headers: [
        {
          text: 'Bestellnummer',
          align: 'start',
          value: 'number',
        },
        {
          text: 'Vorname',
          value: 'billing.first_name',
        },
        {
          text: 'Nachname',
          value: 'billing.last_name',
        },
        {
          text: 'Zahlungsart',
          value: 'payment_method_title',
        },
        {
          text: 'Status',
          value: 'status',
        },
        {
          text: 'Preis',
          value: 'total',
        },
        { text: 'Actions', value: 'actions', align: 'end', sortable: false },
      ],
      orders: [],
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
     this.orders = this.$store.state.orders
    },

    editItem (item) {
        this.editedIndex = this.orders.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
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
          axios.patch(`https://bindis-schaulaedle.de/wp-json/wc/v3/products/tags/${this.editedItem.id}?consumer_key=ck_04911d593cc006c24c8acbe6ebc4b1e55af6ae33&consumer_secret=cs_9b1bd2702eb5fc89f5b55d40fa8dafe622c2bddc`,
          this.editedItem)
          .then(res => {
            this.$store.state.orders[this.editedIndex] = res.data
            this.btnLoading = false
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
      }
  },
  created() {
    this.getData()
  }
}
</script>

<style>

</style>