self.addEventListener('message', (e) => {
    if (!e.data) {
      return;
    }
  
    switch (e.data) {
      case 'skipWaiting':
        self.skipWaiting();
        break;
      default:
        // NOOP
        break;
    }
  });

  self.addEventListener("fetch", evt => {
    console.log(evt)
  })
  
  workbox.core.clientsClaim(); // Vue CLI 4 and Workbox v4, else
  // workbox.clientsClaim(); // Vue CLI 3 and Workbox v3.
  
  // The precaching code provided by Workbox.
  self.__precacheManifest = [].concat(self.__precacheManifest || []);
  // workbox.precaching.suppressWarnings(); // Only used with Vue CLI 3 and Workbox v3.
  workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
