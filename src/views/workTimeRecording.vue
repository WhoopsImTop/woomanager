<template>
  <v-container>
      <v-row cols=12>
          <v-col cols=8>
              <v-card class="glass pa-3 d-flex justify-space-between align-center mt-5">
                <h1>Zeiterfassung</h1>
                <v-chip label class="glass2">
                  <span>Überstunden 6H 20M</span>
                </v-chip>
                <v-btn color="success">Arbeitszeit einreichen</v-btn>
              </v-card>

              <v-data-table
                class="glass mt-5"
                dark
                :headers="headers"
                :items="items"
                >
                <template v-slot:item.time="{ item }">
                    <v-chip label class="glass2">
                        <span>{{ calculateWorkTime(item.startZeit, item.endZeit) }}</span>
                    </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon
                    small
                    class="mr-2"
                    @click="modelDialog(item)"
                    >
                    mdi-pencil
                    </v-icon>
                    <v-icon
                    small
                    class="mr-2"
                    @click="modelDialog(item)"
                    >
                    mdi-delete
                    </v-icon>
                </template>
                </v-data-table>
          </v-col>
          <v-col cols=4>
              <v-card dark class="glass mt-5">
                  <v-card-title>
                    <h3>Deine heutige Arbeitszeit</h3>
                  </v-card-title>
                <v-divider class="mt-3 mb-5"></v-divider>
                <v-card-text class="d-flex justify-center align-center">
                    <v-progress-circular
                        :rotate="270"
                        :size="150"
                        :width="20"
                        :value="6"
                        color="orange"
                        >
                        {{ value }}
                    </v-progress-circular>
                </v-card-text>
                <v-card-text>
                    <h3>Arbeitszeit bearbeiten</h3>
                    <v-divider class="mt-3 mb-5"></v-divider>
                    <v-row cols=12>
                        <v-col cols=6>
                            <v-text-field
                            label="Startzeit"
                            v-model="$store.state.startTime"
                            outlined
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols=6>
                            <v-text-field
                            label="Endzeit"
                            v-model="$store.state.endTime"
                            outlined
                            >
                            </v-text-field>
                        </v-col>
                        <v-col style="margin-top: -30px" cols=6>
                            <div class="glass" style="display: flex; align-items: center; justify-content: center; height: 56px; border-radius:3px !important">
                                <span>{{calculateHours($store.state.startTime, $store.state.endTime)}}</span>
                            </div>
                        </v-col>
                        <v-col style="margin-top: -30px" cols=6>
                            <div class="glass" style="display: flex; align-items: center; justify-content: center; height: 56px; border-radius:3px !important">
                                <span>{{calculateMinutes($store.state.startTime, $store.state.endTime)}}</span>
                            </div>
                        </v-col>
                        <v-col cols=12>
                            <v-text-field
                            label="Datum"
                            v-model="date"
                            outlined
                            >
                            </v-text-field>
                        </v-col>
                        <v-col style="margin-top: -30px">
                            <v-btn color="success" @click="saveWorkTime()" block>Arbeitszeit Speichern</v-btn>
                        </v-col>
                    </v-row>
                    <v-divider class="mt-3 mb-5"></v-divider>
                    <div class="glass py-2">
                        Die Arbeitszeit wird auf Basis deiner Browser Interaktion gemessen. Hierbei kann es zu Abweichungen kommen. Das ist kein genauer Wert. Sie können oben die Arbeitszeit bearbeiten.
                    </div>
                </v-card-text>
              </v-card>
          </v-col>
      </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
export default {
    data: () => {
        return {
            items: [],
            headers: [
                { text: "Datum", align: "start", sortable: false, value: "Datum"},
                { text: "Bearbeiter", align: "start", sortable: false, value: "Bearbeiter"},
                { text: "Arbeitszeit", align: "end", sortable: false, value: 'time'},
                { text: 'Funktionen', align: "end", value: 'actions', sortable: false },   
            ]
        }
    },
    methods: {
        calculateHours(start, end) {
            start = new Date().getMonth() -1 + "." + new Date().getDate() + "." + new Date().getFullYear() + " " + start;
            end = new Date().getMonth() -1 + "." + new Date().getDate() + "." + new Date().getFullYear() + " " + end;
            let startTime = new Date(start);
            let endTime = new Date(end);
            let diff = endTime.getTime() - startTime.getTime();
            let diffMinutes = Math.round(diff / 60000);
            let hours = Math.floor(diffMinutes / 60);
            return hours + " Stunden";
        },
        calculateMinutes(start, end) {
            start = new Date().getMonth() -1 + "." + new Date().getDate() + "." + new Date().getFullYear() + " " + start;
            end = new Date().getMonth() -1 + "." + new Date().getDate() + "." + new Date().getFullYear() + " " + end;
            let startTime = new Date(start);
            let endTime = new Date(end);
            let diff = endTime.getTime() - startTime.getTime();
            let diffMinutes = Math.round(diff / 60000);
            let minutes = diffMinutes % 60;
            return minutes + " Minuten";
        },
        calculateWorkTime(start, end) {
            let startTime = new Date(start);
            let endTime = new Date(end);
            let diff = endTime.getTime() - startTime.getTime();
            let diffMinutes = Math.round(diff / 60000);
            let hours = Math.floor(diffMinutes / 60);
            let minutes = diffMinutes % 60;
            return hours + ":" + minutes;
        },
        getDate() {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            return day + "." + month + "." + year;
        },
        getWorkTime() {
            axios
            .get('https://bindis.rezept-zettel.de/api/zeiten/' + localStorage.getItem('userName').split(' ')[0])
            .then(response => {
                this.items = response.data;
            })
        },
        saveWorkTime() {
            let date = this.date.split('.')[1] + "." + this.date.split('.')[0] + "." + this.date.split('.')[2];
            let startTime = date + " " + this.$store.state.startTime;
            let endTime = date + " " + this.$store.state.endTime;
            console.log(startTime);
            axios
            .post('https://bindis.rezept-zettel.de/api/zeiten/', {
                endZeit: startTime,
                startZeit: endTime,
                Zeit: this.calculateWorkTime(startTime, endTime),
                Bearbeiter: localStorage.getItem('userName').split(' ')[0]
            })
            .then(response => {
                console.log(response)
                this.getWorkTime();
            })
        }
    },
    mounted() {
        this.$store.state.endTime = new Date().toTimeString().split(' ')[0];
        this.date = this.getDate();
        this.getWorkTime();
    }
}
</script>

<style>

</style>