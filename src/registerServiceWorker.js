/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register('/service-worker.js', {
    registrationOptions: { scope: './' },
    ready () {
      console.log('Service worker is active.')
    }, 
    registered (registration) {
      console.log('Service worker has been registered.')
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 60); // e.g. hourly checks  
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated (registration) {
      console.log('New content is available; please refresh.')
      document.dispatchEvent(
        new CustomEvent('swUpdated', { detail: registration })
      );
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
