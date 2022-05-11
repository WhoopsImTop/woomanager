<template>
    <div>
        <v-row v-if="!tokenChecker" cols=12>
            <v-col class="mx-auto my-auto" cols=3>
                <v-card dark class="glass">
                    <v-card-title>
                        Anmelden
                    </v-card-title>
                    <v-card-text>
                        <v-col v-if="!register">
                        <v-text-field
                            v-model="email"
                            label="Email"
                            outlined
                            required
                        ></v-text-field>
                        <v-text-field
                            v-model="password"
                            label="Passwort"
                            outlined
                            type="password"
                            required
                        ></v-text-field>
                        </v-col>
                        <v-col v-else>
                            <v-text-field
                                v-model="name"
                                label="Name"
                                outlined
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="email"
                                label="Email"
                                outlined
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="password"
                                label="Passwort"
                                outlined
                                type="password"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="hours"
                                label="Stunden im Monat"
                                outlined
                                required
                            ></v-text-field>
                            <v-combobox
                                v-model="selectedSubscription"
                                :items="subscription"
                                label="Abo-Model"
                                outlined
                                required
                            ></v-combobox>
                        </v-col>
                        <v-col>
                            <v-btn
                                block
                                color="primary"
                                @click="register ? registerUser() : loginUser()"
                                :disabled="!email || !password"
                            >
                                {{ register ? 'Registrieren' : 'Anmelden' }}
                            </v-btn>
                            <v-btn
                                @click="register = !register"
                                class="mt-3"
                                block
                                color="accent"
                                >
                                {{ register ? 'Anmelden' : 'Registrieren' }}
                            </v-btn>
                        </v-col>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
      <v-row v-else cols=12>
          <v-col cols=7>
              <v-card class="glass pa-3 d-flex justify-space-between align-center mt-5">
                <h1>Zeiterfassung</h1>
                <v-chip label class="glass2">
                  <span>Überstunden {{ overTime }}</span>
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
                        <span>{{ item.dauer }}</span>
                    </v-chip>
                </template>
                <template v-slot:item.date="{item}">
                    <span>{{ new Date(item.erstellt_am).toLocaleDateString('de-DE') }}</span>
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
                    @click="deleteWorkTime(item)"
                    >
                    mdi-delete
                    </v-icon>
                </template>
                </v-data-table>
                <div class="glass2 pa-4 mt-5" style="display: flex; justify-content: space-between; align-items: center">
                    <span>Deine wöchentliche Arbeitszeit: {{ monthHours / 4 }} Stunden</span>
                    <v-progress-linear
                    dark
                    color="accent"
                    :value="calculatePercentageOfMonth()"
                    style="width: 100px"
                    height="25"
                    ><template v-slot:default="{ value }">
                        {{ value }}
                    </template>
                    </v-progress-linear>
                    <span>Du hast {{ calculateAllItemsTogehter() }} | {{ monthHours }} Stunden gearbeitet</span>
                </div>
          </v-col>
          <v-col cols=5>
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
                        :value="calculatePercentageOfCircle"
                        color="accent"
                        >
                        {{ (calculatePercentageOfCircle / 100 * 8).toFixed(1) + " Stunden"}}
                    </v-progress-circular>
                </v-card-text>
                <v-card-text>
                    <h3>Arbeitszeit bearbeiten</h3>
                    <v-divider class="mt-3 mb-5"></v-divider>
                    <v-row cols=12>
                        <v-col cols=12>
                            <v-text-field
                            label="Datum"
                            v-model="date"
                            outlined
                            :hint="errorHint"
                            >
                        </v-text-field>
                        </v-col>
                        <v-col cols=6>
                            <v-text-field
                            label="Startzeit"
                            outlined
                            v-model="$store.state.startTime"
                            ></v-text-field>
                        </v-col>
                        <v-col cols=6>
                            <v-text-field
                            label="Endzeit"
                            outlined
                            v-model="$store.state.endTime"
                            ></v-text-field>
                        </v-col>
                        <v-col cols=6>
                            <v-text-field
                            label="Stunden"
                            v-model="calculateHours"
                            outlined
                            >
                            </v-text-field>
                        </v-col>
                        <v-col cols=6>
                            <v-text-field
                            label="Minuten"
                            v-model="calculateMinutes"
                            outlined
                            >
                            </v-text-field>
                        </v-col>
                        <v-col>
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
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data: () => {
        return {
            items: [],
            register: false,
            email: '',
            password: '',
            hours: '',
            errorHint: '',
            selectedSubscription: '',
            overTime: 0,
            monthHours: 0,
            subscription: [
                {
                    text: "Standard 5€/Monat",
                    value: "standard"
                },
                {
                    text: "Premium 15€/Monat",
                    value: "premium"
                }
            ],
            headers: [
                { text: "Datum", align: "start", sortable: false, value: "date", width: "100" },
                { text: "Start", align: "start", sortable: false, value: "startZeit", width: "150"},
                { text: "Ende", align: "start", sortable: false, value: "endZeit", width: "150"},
                { text: "Arbeitszeit", align: "end", sortable: false, value: 'time'},
                { text: 'Funktionen', align: "end", value: 'actions', sortable: false },   
            ],
            startTime: '',
        }
    },
    computed: {
        convertToTimeString(time) {
            return new Date(time).toTimeString()
        },
        tokenChecker() {
            return localStorage.getItem('workTimeToken') ? true : false;
        },
        startDate() {
            let currentDate = new Date().getDate() + '.' + (new Date().getMonth() + 1) + '.' + new Date().getFullYear();
            return new Date(currentDate + " " + this.$store.state.startTime).toLocaleString('de-DE');
        },
        calculateHours() {
            let startTime = new Date(this.date + " " + this.$store.state.startTime);
            let endTime = new Date(this.date + " " + this.$store.state.endTime);
            let diff = endTime.getTime() - startTime.getTime();
            let hours = Math.floor(diff / (1000 * 60 * 60)) ? Math.floor(diff / (1000 * 60 * 60)) : 0;
            return hours;
        },
        calculateMinutes() {
            let startTime = new Date(this.date + " " + this.$store.state.startTime);
            let endTime = new Date(this.date + " " + this.$store.state.endTime);
            let diff = endTime.getTime() - startTime.getTime() - (this.calculateHours * 60 * 60 * 1000);
            let minutes = Math.floor(diff / (1000 * 60)) ? Math.floor(diff / (1000 * 60)) : 0;
            return minutes;
        },
        calculatePercentageOfCircle() {
            //calculate percentage of circle with max 8 hours with start and end time
            let startTime = new Date(this.date + " " + this.$store.state.startTime);
            let endTime = new Date(this.date + " " + this.$store.state.endTime);
            let diff = endTime.getTime() - startTime.getTime() ? endTime.getTime() - startTime.getTime() : 0;
            let minutes = Math.floor(diff / (1000 * 60));
            let percentage = minutes / 480 * 100;
            return percentage;           
        },
    },
    methods: {        
        
        deleteWorkTime(item) {
            axios.delete('https://bindis.rezept-zettel.de/api/zeiten/' + item._id)
            .then(response => {
                this.items = response.data;
                this.getWorkTime();
            })
            .catch(error => {
                console.log(error);
            });
        },

        calculateWorkTime(start, end) {
            let startTime = new Date(start);
            let endTime = new Date(end);
            //calculate minutes and hours
            let diff = Math.abs(endTime.getTime() - startTime.getTime()) / 1000;
            let hours = Math.floor(diff / 3600) % 24;
            let minutes = Math.floor(diff / 60) % 60;
            return hours + ":" + minutes;
            
        },
        registerUser() {
            axios
            .post('https://bindis.rezept-zettel.de/api/users/create', {
                name: this.name,
                hours: this.hours,
                email: this.email,
                password: this.password,
                url: window.location.href,
                subscription: this.selectedSubscription.value
            })
            .then(() => {
                this.register = false;
                this.name = '';
                this.email = '';
                this.password = '';
                this.hours = '';
                this.selectedSubscription = '';
            })
            .catch(() => {
                window.alert("Es gab einen fehler probiere es erneut")
            });
        },
        loginUser() {
            axios
            .post('https://bindis.rezept-zettel.de/api/users/login', {
                email: this.email,
                password: this.password,
            })
            .then(response => {
                this.register = false;
                this.email = '';
                this.password = '';
                this.selectedSubscription = '';
                localStorage.setItem("workTimeToken", response.data.accesstoken);
                localStorage.setItem("workTimeUser", response.data.id);
                localStorage.setItem("workTimeUserName", response.data.name);
            })
            .catch(() => {
                window.alert("Es gab einen fehler probiere es erneut")
            });
        },
        calculateAllItemsTogehter() {
            // calculate all items togehter and return minutes and hours
            let hours = 0;
            let min = 0;
            this.items.forEach(item => {
                let startTime = new Date(item.startZeit);
                let endTime = new Date(item.endZeit ? item.endZeit : item.startZeit);
                let diff = Math.abs(endTime.getTime() - startTime.getTime()) / 1000;
                hours += Math.floor(diff / 3600) % 24;
                min += Math.floor(diff / 60) % 60;
            });
            return hours + ":" + min;
        },
        calculatePercentageOfMonth() {
            let hours = 0;
            let minutes = 0;
            this.items.forEach(item => {
                let startTime = new Date(item.startZeit);
                let endTime = new Date(item.endZeit ? item.endZeit : item.startZeit);
                let diff = Math.abs(endTime.getTime() - startTime.getTime()) / 1000;
                hours += Math.floor(diff / 3600) % 24;
                minutes += Math.floor(diff / 60) % 60;
            });
            let totalMinutes = (hours * 60) + minutes;
            let monthMinutes = (this.monthHours * 60);
            let percentage = (totalMinutes / monthMinutes) * 100;
            return percentage.toFixed(2) + '%';
        },
        getDate() {
            let day = new Date().getDate();
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            return day + "." + month + "." + year;
        },
        getWorkTime() {
            axios
            .get('https://bindis.rezept-zettel.de/api/zeiten/' + localStorage.getItem('workTimeUser'))
            .then(response => {
                this.items = response.data;
            })
        },
        saveWorkTime() {
            let startTime = this.date + ", " + this.$store.state.startTime;
            let endTime = this.date + ", " + this.$store.state.endTime;
            axios
            .post('https://bindis.rezept-zettel.de/api/zeiten/', {
                endZeit: endTime,
                startZeit: startTime,
                dauer: this.calculateWorkTime(startTime, endTime),
                bearbeiter: localStorage.getItem('workTimeUser')
            })
            .then(response => {
                console.log(response)
                this.getWorkTime();
            })
        }
    },
    mounted() {
        this.date = this.getDate();
        this.getWorkTime();
        if(localStorage.getItem('workTimeToken')) {
            axios
            .get('https://bindis.rezept-zettel.de/api/users/' + localStorage.getItem('workTimeUser'))
            .then(response => {
                this.overTime = response.data.overtime;
                this.monthHours = response.data.hours;
            })
        }
    }
}
</script>

<style>

</style>