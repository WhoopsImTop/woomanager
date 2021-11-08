module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pwa: {
    name: "Bindis Management",
    short_name: "WooManager",
    start_url: '.',
    display: 'standalone',
    themeColor: "#424257",
    msTileColor: "#FB7D00",
    appleMobileWebAppCache: "yes",
    appleMobileWebAppStatusBarStyle: "#FB7D00",
    iconPaths: {
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
      maskIcon: 'img/icons/safari-pinned-tab.svg',
      msTileImage: 'img/icons/msapplication-icon-144x144.png'
    },
    manifestOptions: {
      background_color: "#424257"
    }
  }
}
