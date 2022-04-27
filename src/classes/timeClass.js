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
        this.uploadTime()
      }
    })
  }

  startTimer() {
    this.startTime = new Date()
    this.timeInterval = setInterval(() => {
      this.time += 1
    }, 1000)
  }

  pauseTimer() {
    clearInterval(this.timeInterval)
  }

  stopTimer() {
    clearInterval(this.timeInterval)
    this.endTime = new Date()
  }

  getCurrentTimeRecording() {
    //format this.time to HH:MM:SS
    let time = this.time
    let hours = Math.floor(time / 3600)
    let minutes = Math.floor((time - hours * 3600) / 60)
    let seconds = time - hours * 3600 - minutes * 60
    return (
      (hours < 10 ? '0' + hours : hours) +
      ':' +
      (minutes < 10 ? '0' + minutes : minutes) +
      ':' +
      (seconds < 10 ? '0' + seconds : seconds)
    )
  }

  calculateWorkTime() {
    let startTime = this.startTime
    let endTime = this.endTime
    let diff = endTime.getTime() - startTime.getTime()
    // format diff to HH:MM:SS
    let hours = Math.floor(diff / 3600000)
    let minutes = Math.floor((diff % 3600000) / 60000)
    let seconds = Math.floor((diff % 60000) / 1000)
    return (
      (hours < 10 ? '0' + hours : hours) +
      ':' +
      (minutes < 10 ? '0' + minutes : minutes) +
      ':' +
      (seconds < 10 ? '0' + seconds : seconds)
    )
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
