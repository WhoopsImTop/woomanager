import axios from 'axios'

export default class TimeRecording {
  constructor() {
    this.startTime = new Date().toLocaleTimeString('de-DE')
    this.time = null
    this.endTime = null
    this.user = localStorage.getItem('Username')
    this.timeInterval = null
    window.addEventListener('beforeunload', () => {
      if (this.time < 380) {
        this.endTime = new Date().toLocaleTimeString('de-DE')
        this.time = this.endTime - this.startTime
        this.saveTime()
      }
    })
  }

  startTimer() {
    this.startTime =
      new Date().toLocaleDateString('de-DE') +
      ',' +
      new Date().toLocaleTimeString('de-DE')
    this.timeInterval = setInterval(() => {
      this.time = new Date().toLocaleTimeString('de-DE')
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.timeInterval)
  }

  stopTimer() {
    clearInterval(this.timeInterval)
    this.endTime =
      new Date().toLocaleDateString('de-DE') +
      ',' +
      new Date().toLocaleTimeString('de-DE')
  }

  getCurrentTime() {
    return this.time
  }

  calculateWorkTime() {
    let startTime = new Date(this.startTime)
    let endTime = new Date(this.endTime)
    let diff = endTime.getTime() - startTime.getTime()
    let diffMinutes = Math.floor(diff / 1000 / 60)
    return diffMinutes
  }

  saveTime() {
    return new Promise((resolve, reject) => {
      axios
        .post('https://bindis.rezept-zettel.de/api/zeiten/', {
          endZeit: this.endTime,
          startZeit: this.startTime,
          dauer: this.calculateWorkTime(),
          bearbeiter: localStorage.getItem('workTimeUser'),
        })
        .then((response) => {
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}
